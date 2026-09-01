"""
Modal app responsável por transcrever áudio usando WhisperX, substituindo o
serviço de transcrição que hoje roda no Replicate
(victor-upmeet/whisperx-a40-large — ver api/src/infra/trigger/transcribe-audio.task.ts).

Recebe a URL de um áudio e uma callback_url, baixa o áudio, roda a
transcrição + alinhamento de palavras via WhisperX e envia o resultado (ou o
erro) para a callback_url informada. Quem chama esse endpoint e aguarda o
callback é o lado Node/Trigger.dev, no mesmo padrão de waitpoint já usado
para o clip processor (ver main.py).

Deploy:
    cd py
    modal deploy transcribe_audio.py

Requer um Modal Secret chamado "mintly-transcribe-audio-secret" com:
    HF_TOKEN (necessário apenas quando diarize=True é enviado na request)
"""

import os
import pathlib
import shutil
import uuid

import modal
import requests
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

whisperx_image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install("ffmpeg", "git")
    .pip_install(
        "torch==2.1.2",
        "torchaudio==2.1.2",
        index_url="https://download.pytorch.org/whl/cu121",
    )
    .pip_install("git+https://github.com/m-bain/whisperX.git")
    .pip_install("fastapi[standard]")
)

app = modal.App("mintly-transcribe-audio", image=whisperx_image)

# Cacheia os pesos do modelo num Volume para não baixar de novo a cada cold start.
model_volume = modal.Volume.from_name("whisperx-models", create_if_missing=True)


class TranscribeAudioRequest(BaseModel):
    audio_url: str
    callback_url: str
    language: str | None = None
    diarize: bool = False


def download_file(url: str, destination: pathlib.Path) -> None:
    response = requests.get(url, stream=True, timeout=60)
    response.raise_for_status()
    with open(destination, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)


@app.cls(
    gpu="A10G",
    timeout=600,
    retries=0,
    scaledown_window=20,
    volumes={"/cache": model_volume},
    secrets=[modal.Secret.from_name("mintly-transcribe-audio-secret")],
)
class WhisperXService:
    @modal.enter()
    def load_models(self):
        # Precisa ser setado antes de qualquer download de modelo (HF Hub e
        # torch hub). O Volume não pode ser montado direto em "/root/.cache"
        # porque esse path já vem com conteúdo da build da imagem (cache do
        # pip), e Volumes só montam em paths vazios.
        os.environ.setdefault("HF_HOME", "/cache/huggingface")
        os.environ.setdefault("TORCH_HOME", "/cache/torch")

        import whisperx

        self.whisperx = whisperx
        self.device = "cuda"
        self.compute_type = "float16"  # Use "int8" para reduzir uso de VRAM se precisar
        self.model_size = "large-v3"
        self.batch_size = 16  # Sweet spot pra A10G

        print("⚡ Loading WhisperX ASR model...")
        self.model = whisperx.load_model(
            self.model_size,
            self.device,
            compute_type=self.compute_type,
        )

        # Modelo de alinhamento é específico por idioma. Carregado sob demanda
        # (na primeira request de cada idioma) e cacheado aqui pelo tempo de
        # vida do container, em vez de fixar um idioma no cold start.
        self._align_models: dict[str, tuple] = {}

    def _get_align_model(self, language_code: str):
        if language_code not in self._align_models:
            print(f"⚡ Loading alignment model for '{language_code}'...")
            self._align_models[language_code] = self.whisperx.load_align_model(
                language_code=language_code,
                device=self.device,
            )

        return self._align_models[language_code]

    def _transcribe(
        self,
        audio_path: pathlib.Path,
        language: str | None,
        diarize: bool,
    ) -> tuple[list[dict], str]:
        whisperx = self.whisperx

        audio = whisperx.load_audio(str(audio_path))

        transcribe_kwargs = {"batch_size": self.batch_size}
        if language:
            transcribe_kwargs["language"] = language

        result = self.model.transcribe(audio, **transcribe_kwargs)
        detected_language = result["language"]

        align_model, metadata = self._get_align_model(detected_language)
        aligned_result = whisperx.align(
            result["segments"],
            align_model,
            metadata,
            audio,
            self.device,
            return_char_alignments=False,
        )

        if diarize:
            diarize_model = whisperx.DiarizationPipeline(
                use_auth_token=os.environ.get("HF_TOKEN"),
                device=self.device,
            )
            diarize_segments = diarize_model(audio)
            aligned_result = whisperx.assign_word_speakers(diarize_segments, aligned_result)

        return aligned_result["segments"], detected_language

    @modal.method()
    def run_transcription_job(self, request: TranscribeAudioRequest) -> None:
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        result = {}

        try:
            audio_path = base_dir / "input.audio"
            download_file(request.audio_url, audio_path)

            segments, detected_language = self._transcribe(
                audio_path, request.language, request.diarize
            )

            result["status"] = "SUCCESS"
            result["segments"] = segments
            result["language"] = detected_language
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
    def transcribe_audio_request(self, request: TranscribeAudioRequest):
        self.run_transcription_job.spawn(request)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={"status": "ACCEPTED"},
        )
