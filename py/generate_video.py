"""
Modal app responsável por gerar vídeo a partir de texto usando o Wan2.1
T2V 1.3B (https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B), via `diffusers`
(repo `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`, que é o mesmo modelo convertido pro
formato do diffusers — o repo original exige o `generate.py` do projeto Wan).

Recebe um prompt, uma image_url (opcional) e uma callback_url, gera o vídeo,
sobe o mp4 pro R2 e envia o resultado (ou o erro) para a callback_url
informada, no mesmo padrão de waitpoint já usado pelos outros serviços (ver
main.py / transcribe_audio.py / generate_text.py).

ATENÇÃO: o Wan2.1-T2V-1.3B é *text-to-video apenas* — não aceita imagem como
condição (isso é o Wan2.1-I2V, outro modelo). A `image_url` é aceita no
contrato da request, mas **é ignorada** por enquanto.

Deploy:
    cd py
    modal deploy generate_video.py

Requer um Modal Secret chamado "mintly-generate-video-secret" com:
    R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
    HF_TOKEN (opcional — o modelo não é gated, só acelera o download)
"""

import os
import pathlib
import shutil
import time
import uuid

import boto3
import modal
import requests
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

MODEL_NAME = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"

# Valores recomendados na model card: 480P (832x480), 81 frames a 15 fps
# (~5s de vídeo). O modelo foi treinado principalmente em 480P, 720P é menos
# estável.
VIDEO_WIDTH = 832
VIDEO_HEIGHT = 480
NUM_FRAMES = 81
FPS = 15
GUIDANCE_SCALE = 5.0

# Negative prompt sugerido na model card do Wan2.1.
NEGATIVE_PROMPT = (
    "Bright tones, overexposed, static, blurred details, subtitles, style, "
    "works, paintings, images, static, overall gray, worst quality, low "
    "quality, JPEG compression residue, ugly, incomplete, extra fingers, "
    "poorly drawn hands, poorly drawn faces, deformed, disfigured, misshapen "
    "limbs, fused fingers, still picture, messy background, three legs, many "
    "people in the background, walking backwards"
)

# Preço por segundo de GPU no Modal (https://modal.com/pricing), usado pra
# reportar o custo real de cada job pro Trigger.dev via callback_url.
GPU_TYPE = "A10G"
GPU_PRICE_PER_SECOND_USD = {
    "T4": 0.000164,
    "L4": 0.000222,
    "A10G": 0.000306,
    "A100-40GB": 0.000583,
    "A100-80GB": 0.000694,
}

generate_video_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        # O diffusers recente usa `torch.accelerator`, que só existe a partir
        # do torch 2.6 (com 2.4 o import do diffusers quebra).
        "torch==2.6.0",
        index_url="https://download.pytorch.org/whl/cu124",
    )
    .pip_install(
        "diffusers>=0.33.0",
        "transformers",
        "accelerate",
        "ftfy",
        "sentencepiece",
        "imageio[ffmpeg]",
        "boto3",
        "requests",
        "fastapi[standard]",
    )
)

app = modal.App("mintly-generate-video", image=generate_video_image)

# Cacheia os pesos do modelo num Volume para não baixar de novo a cada cold
# start.
model_volume = modal.Volume.from_name("wan-models", create_if_missing=True)


class GenerateVideoRequest(BaseModel):
    prompt: str
    image_url: str | None = None
    callback_url: str


@app.cls(
    gpu=GPU_TYPE,
    timeout=1800,
    retries=0,
    scaledown_window=20,
    volumes={"/cache": model_volume},
    secrets=[modal.Secret.from_name("mintly-generate-video-secret")],
)
class VideoGenerationService:
    @modal.enter()
    def load_model(self):
        # Precisa ser setado antes de importar diffusers/transformers, mesma
        # razão dos outros serviços: o Volume só monta em paths vazios, e
        # "/root/.cache" já vem com conteúdo da build da imagem.
        os.environ.setdefault("HF_HOME", "/cache/huggingface")

        import torch
        from diffusers import AutoencoderKLWan, WanPipeline

        print(f"⚡ Loading {MODEL_NAME}...")
        # O VAE do Wan precisa de float32; o resto roda em bfloat16.
        vae = AutoencoderKLWan.from_pretrained(
            MODEL_NAME,
            subfolder="vae",
            torch_dtype=torch.float32,
        )
        self.pipe = WanPipeline.from_pretrained(
            MODEL_NAME,
            vae=vae,
            torch_dtype=torch.bfloat16,
        )
        self.pipe.to("cuda")

        self.s3_client = boto3.client(
            "s3",
            endpoint_url=os.environ["R2_ENDPOINT"],
            aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        )
        self.bucket_name = os.environ["R2_BUCKET_NAME"]

    def _generate(self, prompt: str, output_path: pathlib.Path) -> None:
        from diffusers.utils import export_to_video

        frames = self.pipe(
            prompt=prompt,
            negative_prompt=NEGATIVE_PROMPT,
            height=VIDEO_HEIGHT,
            width=VIDEO_WIDTH,
            num_frames=NUM_FRAMES,
            guidance_scale=GUIDANCE_SCALE,
        ).frames[0]

        export_to_video(frames, str(output_path), fps=FPS)

    @modal.method()
    def run_generation_job(self, request: GenerateVideoRequest) -> None:
        run_id = str(uuid.uuid4())
        base_dir = pathlib.Path("/tmp") / run_id
        base_dir.mkdir(parents=True, exist_ok=True)

        started_at = time.monotonic()

        result = {}

        try:
            if request.image_url:
                print(
                    "image_url recebida mas ignorada: Wan2.1-T2V-1.3B é "
                    "text-to-video apenas."
                )

            output_path = base_dir / "output.mp4"
            self._generate(request.prompt, output_path)

            output_key = f"videos/{run_id}.mp4"
            self.s3_client.upload_file(str(output_path), self.bucket_name, output_key)

            result["status"] = "SUCCESS"
            result["output_key"] = output_key
        except Exception as error:
            result["status"] = "ERROR"
            result["error"] = str(error)
        finally:
            shutil.rmtree(base_dir, ignore_errors=True)

        # GPU é cobrada do início ao fim da execução, sucesso ou erro —
        # reporta o custo real pro Trigger.dev poder repassar pro Polar.
        elapsed_seconds = time.monotonic() - started_at
        result["cost"] = {
            "amount": round(elapsed_seconds * GPU_PRICE_PER_SECOND_USD[GPU_TYPE] * 100, 4),
            "currency": "usd",
        }

        try:
            requests.post(request.callback_url, json=result, timeout=30)
        except requests.RequestException as error:
            print(f"Failed to call back {request.callback_url}: {error}")

    @modal.fastapi_endpoint(method="POST")
    def generate_video_request(self, request: GenerateVideoRequest):
        self.run_generation_job.spawn(request)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={"status": "ACCEPTED"},
        )
