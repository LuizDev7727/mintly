"""
Modal app responsável por gerar texto usando Qwen2.5 14B Instruct (era 7B,
que não seguia restrições como a duração de 30-45s dos clipes), substituindo
o Gemini (gemini-2.5-flash-lite) na geração de SEO (título, descrição e
tags) — ver api/src/infra/trigger/seo-enrichment.task.ts. O Gemini vinha
apresentando erros de sobrecarga (503 / "model is overloaded") que
quebravam o pipeline de geração de SEO.

Recebe um prompt e uma callback_url, roda a geração via Qwen2.5 14B e envia
o resultado (ou o erro) para a callback_url informada, no mesmo padrão de
waitpoint já usado pelos outros serviços (ver main.py / transcribe_audio.py).

Deploy:
    cd py
    modal deploy generate_text.py

Requer um Modal Secret chamado "mintly-generate-text-secret" com:
    HF_TOKEN (opcional — acelera o download do modelo e evita rate limit
    do Hugging Face Hub; Qwen2.5 não é um modelo gated)
"""

import os
import time

import modal
import requests
from fastapi import status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

MODEL_NAME = "Qwen/Qwen2.5-14B-Instruct"
# 20 momentos com título, descrição SEO e tags em JSON passam fácil de 2048
# tokens; cortar no meio quebra o JSON.parse no Node.
MAX_NEW_TOKENS = 6144

# Preço por segundo de GPU no Modal (https://modal.com/pricing), usado pra
# reportar o custo real de cada job pro Trigger.dev via callback_url.
# O 14B em bf16 (~30GB) não cabe na A10G (24GB), por isso A100-40GB.
GPU_TYPE = "A100-40GB"
GPU_PRICE_PER_SECOND_USD = {
    "T4": 0.000164,
    "L4": 0.000222,
    "A10G": 0.000306,
    "A100-40GB": 0.000583,
    "A100-80GB": 0.000694,
}

generate_text_image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install(
        "torch==2.4.0",
        index_url="https://download.pytorch.org/whl/cu121",
    )
    .pip_install(
        "transformers==4.46.0",
        "accelerate==1.0.1",
        "fastapi[standard]",
    )
)

app = modal.App("mintly-generate-text", image=generate_text_image)

# Cacheia os pesos do modelo num Volume para não baixar de novo (~30GB) a
# cada cold start.
model_volume = modal.Volume.from_name("qwen-models", create_if_missing=True)


class GenerateTextRequest(BaseModel):
    prompt: str
    callback_url: str


@app.cls(
    gpu=GPU_TYPE,
    timeout=600,
    retries=0,
    scaledown_window=20,
    volumes={"/cache": model_volume},
    secrets=[modal.Secret.from_name("mintly-generate-text-secret")],
)
class TextGenerationService:
    @modal.enter()
    def load_model(self):
        # Precisa ser setado antes de importar transformers, mesma razão do
        # WhisperXService em transcribe_audio.py: o Volume só monta em paths
        # vazios, e "/root/.cache" já vem com conteúdo da build da imagem.
        os.environ.setdefault("HF_HOME", "/cache/huggingface")

        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        print(f"⚡ Loading {MODEL_NAME}...")
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.model = AutoModelForCausalLM.from_pretrained(
            MODEL_NAME,
            torch_dtype=torch.bfloat16,
            device_map="cuda",
        )

    def _generate(self, prompt: str) -> str:
        messages = [{"role": "user", "content": prompt}]
        chat_input = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer([chat_input], return_tensors="pt").to(
            self.model.device
        )

        output_ids = self.model.generate(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
        )

        generated_ids = output_ids[0][inputs.input_ids.shape[1] :]
        return self.tokenizer.decode(generated_ids, skip_special_tokens=True)

    @modal.method()
    def run_generation_job(self, request: GenerateTextRequest) -> None:
        started_at = time.monotonic()

        result = {}

        try:
            text = self._generate(request.prompt)
            result["status"] = "SUCCESS"
            result["text"] = text
        except Exception as error:
            result["status"] = "ERROR"
            result["error"] = str(error)

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
    def generate_text_request(self, request: GenerateTextRequest):
        self.run_generation_job.spawn(request)

        return JSONResponse(
            status_code=status.HTTP_202_ACCEPTED,
            content={"status": "ACCEPTED"},
        )
