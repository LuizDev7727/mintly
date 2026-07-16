"""
Modal app responsável pelo passo 3 do pipeline (processamento de cada clipe):
corta o trecho do vídeo original, roda active-speaker-detection (LR-ASD) para
descobrir quem está falando em cada frame, gera um vídeo vertical 1080x1920
seguindo o rosto (crop) ou com fundo desfocado (resize), queima as legendas
e sobe o resultado pro R2.

A transcrição e a identificação dos melhores momentos (steps 1 e 2) já
acontecem no lado Node/Trigger.dev — este serviço recebe um clipe por vez
(URL do vídeo original, start/end e palavras) e processa apenas ele. Quem
decide chamar este endpoint uma vez por clipe é o lado Node (ex: um token
de espera por item, como no padrão de loop com waitpoints do Trigger.dev).

Deploy:
    cd py
    modal deploy main.py

Requer um Modal Secret chamado "mintly-clip-processor-secret" com:
    R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
"""

import os
import pathlib
import pickle
import shutil
import subprocess
import uuid

import boto3
import cv2
import ffmpegcv
import modal
import numpy as np
import pysubs2
import requests
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from tqdm import tqdm

LR_ASD_DIR = "/LR-ASD"

image = (
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.12")
    .apt_install(["ffmpeg", "libgl1-mesa-glx", "wget", "libcudnn8", "libcudnn8-dev"])
    .pip_install_from_requirements("requirements.txt")
    .run_commands(
        [
            "mkdir -p /usr/share/fonts/truetype/custom",
            "wget -O /usr/share/fonts/truetype/custom/Anton-Regular.ttf "
            "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
            "fc-cache -f -v",
        ]
    )
    .add_local_dir("LR-ASD", LR_ASD_DIR, copy=True)
)

app = modal.App("mintly-clip-processor", image=image)


class Word(BaseModel):
    word: str
    start: float
    end: float


class ProcessClipRequest(BaseModel):
    video_url: str
    callback_url: str
    start_time: float
    end_time: float
    words: list[Word] = []


def download_file(url: str, destination: pathlib.Path) -> None:
    response = requests.get(url, stream=True, timeout=60)
    response.raise_for_status()
    with open(destination, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


def run_active_speaker_detection(
    base_dir: pathlib.Path, clip_dir: pathlib.Path, clip_name: str
) -> tuple[list, list]:
    command = [
        "python",
        "Columbia_test.py",
        "--videoName",
        clip_name,
        "--videoFolder",
        str(base_dir),
        "--pretrainModel",
        "weight/finetuning_TalkSet.model",
    ]
    subprocess.run(command, cwd=LR_ASD_DIR, check=True)

    tracks_path = clip_dir / "pywork" / "tracks.pckl"
    scores_path = clip_dir / "pywork" / "scores.pckl"
    if not tracks_path.exists() or not scores_path.exists():
        raise FileNotFoundError(f"Tracks ou scores não encontrados para {clip_name}")

    with open(tracks_path, "rb") as f:
        tracks = pickle.load(f)
    with open(scores_path, "rb") as f:
        scores = pickle.load(f)

    return tracks, scores


def create_vertical_video(
    tracks,
    scores,
    pyframes_path: pathlib.Path,
    pyavi_path: pathlib.Path,
    audio_path: pathlib.Path,
    output_path: pathlib.Path,
    framerate: int = 25,
) -> None:
    target_width = 1080
    target_height = 1920

    flist = sorted(pathlib.Path(pyframes_path).glob("*.jpg"))
    faces = [[] for _ in range(len(flist))]

    for tidx, track in enumerate(tracks):
        score_array = scores[tidx]
        for fidx, frame in enumerate(track["track"]["frame"].tolist()):
            slice_start = max(fidx - 30, 0)
            slice_end = min(fidx + 30, len(score_array))
            score_slice = score_array[slice_start:slice_end]
            avg_score = float(np.mean(score_slice) if len(score_slice) > 0 else 0)

            faces[frame].append(
                {
                    "track": tidx,
                    "score": avg_score,
                    "s": track["proc_track"]["s"][fidx],
                    "x": track["proc_track"]["x"][fidx],
                    "y": track["proc_track"]["y"][fidx],
                }
            )

    temp_video_path = pyavi_path / "video_only.mp4"

    vout = None
    for fidx, fname in tqdm(enumerate(flist), total=len(flist), desc="Creating vertical video"):
        img = cv2.imread(str(fname))
        if img is None:
            continue

        current_faces = faces[fidx]
        max_score_face = max(current_faces, key=lambda face: face["score"]) if current_faces else None

        if max_score_face and max_score_face["score"] < 0:
            max_score_face = None

        if vout is None:
            vout = ffmpegcv.VideoWriterNV(
                file=str(temp_video_path),
                codec=None,
                fps=framerate,
                resize=(target_width, target_height),
            )

        mode = "crop" if max_score_face else "resize"

        if mode == "resize":
            scale = target_width / img.shape[1]
            resized_height = int(img.shape[0] * scale)
            resized_image = cv2.resize(img, (target_width, resized_height), interpolation=cv2.INTER_AREA)

            scale_for_bg = max(target_width / img.shape[1], target_height / img.shape[0])
            bg_width = int(img.shape[1] * scale_for_bg)
            bg_height = int(img.shape[0] * scale_for_bg)

            blurred_background = cv2.resize(img, (bg_width, bg_height))
            blurred_background = cv2.GaussianBlur(blurred_background, (121, 121), 0)

            crop_x = (bg_width - target_width) // 2
            crop_y = (bg_height - target_height) // 2
            blurred_background = blurred_background[crop_y : crop_y + target_height, crop_x : crop_x + target_width]

            center_y = (target_height - resized_height) // 2
            blurred_background[center_y : center_y + resized_height, :] = resized_image

            vout.write(blurred_background)
        else:
            scale = target_height / img.shape[0]
            resized_image = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
            frame_width = resized_image.shape[1]

            center_x = int(max_score_face["x"] * scale)
            top_x = max(min(center_x - target_width // 2, frame_width - target_width), 0)

            image_cropped = resized_image[0:target_height, top_x : top_x + target_width]
            vout.write(image_cropped)

    if vout:
        vout.release()

    ffmpeg_command = (
        f"ffmpeg -y -i {temp_video_path} -i {audio_path} "
        f"-c:v h264 -preset fast -crf 23 -c:a aac -b:a 128k {output_path}"
    )
    subprocess.run(ffmpeg_command, shell=True, check=True, text=True)


def create_subtitles_with_ffmpeg(
    words: list[Word],
    clip_start: float,
    clip_end: float,
    clip_video_path: pathlib.Path,
    output_path: pathlib.Path,
    max_words: int = 5,
) -> None:
    clip_words = [w for w in words if w.end > clip_start and w.start < clip_end]

    subtitles = []
    current_words: list[str] = []
    current_start = None
    current_end = None

    for word in clip_words:
        text = word.word.strip()
        if not text:
            continue

        start_rel = max(0.0, word.start - clip_start)
        end_rel = max(0.0, word.end - clip_start)
        if end_rel <= 0:
            continue

        if not current_words:
            current_start = start_rel
            current_end = end_rel
            current_words = [text]
        elif len(current_words) >= max_words:
            subtitles.append((current_start, current_end, " ".join(current_words)))
            current_words = [text]
            current_start = start_rel
            current_end = end_rel
        else:
            current_words.append(text)
            current_end = end_rel

    if current_words:
        subtitles.append((current_start, current_end, " ".join(current_words)))

    subs = pysubs2.SSAFile()
    subs.info["WrapStyle"] = 0
    subs.info["ScaledBorderAndShadow"] = "yes"
    subs.info["PlayResX"] = 1080
    subs.info["PlayResY"] = 1920
    subs.info["ScriptType"] = "v4.00+"

    style_name = "Default"
    new_style = pysubs2.SSAStyle()
    new_style.fontname = "Anton"
    new_style.fontsize = 140
    new_style.primarycolor = pysubs2.Color(255, 255, 255)
    new_style.outline = 2.0
    new_style.shadow = 2.0
    new_style.shadowcolor = pysubs2.Color(0, 0, 0, 128)
    new_style.alignment = 2
    new_style.marginl = 50
    new_style.marginr = 50
    new_style.marginv = 50
    new_style.spacing = 0.0
    subs.styles[style_name] = new_style

    for start, end, text in subtitles:
        subs.events.append(
            pysubs2.SSAEvent(
                start=pysubs2.make_time(s=start),
                end=pysubs2.make_time(s=end),
                text=text,
                style=style_name,
            )
        )

    subtitle_path = output_path.parent / "temp_subtitles.ass"
    subs.save(str(subtitle_path))

    ffmpeg_cmd = (
        f'ffmpeg -y -i {clip_video_path} -vf "ass={subtitle_path}" '
        f"-c:v h264 -preset fast -crf 23 {output_path}"
    )
    subprocess.run(ffmpeg_cmd, shell=True, check=True)


def process_clip(
    base_dir: pathlib.Path,
    original_video_path: pathlib.Path,
    clip_id: str,
    start_time: float,
    end_time: float,
    words: list[Word],
) -> pathlib.Path:
    clip_name = f"clip_{clip_id}"
    clip_video_path = base_dir / f"{clip_name}.mp4"
    clip_dir = base_dir / clip_name

    duration = end_time - start_time
    cut_command = [
        "ffmpeg",
        "-y",
        "-i",
        str(original_video_path),
        "-ss",
        str(start_time),
        "-t",
        str(duration),
        # Recodifica em vez de "-c copy": um corte que não cai num keyframe
        # gera vídeo congelado quando só copiamos o stream (ver instructions.md).
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        str(clip_video_path),
    ]
    subprocess.run(cut_command, check=True, capture_output=True)

    # Columbia_test.py recria clip_dir do zero (pyavi/pyframes/pywork/pycrop),
    # inclusive extraindo o próprio audio.wav — não precisamos extrair antes.
    tracks, scores = run_active_speaker_detection(base_dir, clip_dir, clip_name)

    pyframes_path = clip_dir / "pyframes"
    pyavi_path = clip_dir / "pyavi"
    audio_path = pyavi_path / "audio.wav"

    vertical_video_path = pyavi_path / "video_out_vertical.mp4"
    output_path = pyavi_path / "video_with_subtitles.mp4"

    create_vertical_video(tracks, scores, pyframes_path, pyavi_path, audio_path, vertical_video_path)
    create_subtitles_with_ffmpeg(words, start_time, end_time, vertical_video_path, output_path)

    return output_path


@app.cls(
    gpu="A10G",
    timeout=900,
    retries=0,
    scaledown_window=20,
    secrets=[modal.Secret.from_name("mintly-clip-processor-secret")],
)
class ClipProcessor:
    @modal.enter()
    def setup(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        )
        self.bucket_name = os.environ["R2_BUCKET_NAME"]

    @modal.method()
    def run_processing_job(self, request: ProcessClipRequest) -> None:
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        output_key = f"clips/{run_id}.mp4"
        result = {"output_key": output_key}

        try:
            video_path = base_dir / "input.mp4"
            download_file(request.video_url, video_path)

            output_video_path = process_clip(
                base_dir,
                video_path,
                run_id,
                request.start_time,
                request.end_time,
                request.words,
            )

            self.s3_client.upload_file(str(output_video_path), self.bucket_name, output_key)

            result["status"] = "SUCCESS"
        except Exception as error:
            result["status"] = "ERROR"
            result["error"] = str(error)
        finally:
            shutil.rmtree(base_dir, ignore_errors=True)

        try:
            requests.post(request.callback_url, json=result, timeout=30)
        except requests.RequestException as error:
            print(f"Failed to call back {request.callback_url}: {error}")

    @modal.fastapi_endpoint(method="POST")
    def process_clip_request(self, request: ProcessClipRequest):
        self.run_processing_job.spawn(request)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={"status": "ACCEPTED"},
        )
