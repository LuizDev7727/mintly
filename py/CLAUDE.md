# py/ — Serviços Modal

Dois serviços Python independentes, hospedados no **Modal** (GPU sob demanda), fora do processo principal da API (`api/`). Cada um é um app Modal separado, com sua própria imagem/deploy — não há um pacote Python compartilhado entre eles (por isso algumas coisas, como a tabela de preço de GPU, aparecem duplicadas nos dois arquivos).

São chamados pelo Node (`api/src/infra/trigger/*.task.ts`) via HTTP, usando o padrão de waitpoint do Trigger.dev (ver `api/src/infra/trigger/CLAUDE.md`) — o Node dispara a chamada, gera um token de espera e fica suspenso até o Modal chamar de volta via `callback_url`.

## Arquivos

### `main.py` — `mintly-clip-processor`

Apesar do nome genérico, **não é um entrypoint genérico** — é especificamente o processador de clipes (passo 3 do pipeline). Recebe um clipe por vez (URL do vídeo original, `start_time`/`end_time`, palavras) e:

1. Corta o trecho do vídeo original via ffmpeg (recodifica, nunca `-c copy` — ver nota sobre keyframes no `instructions.md`).
2. Roda active-speaker-detection (LR-ASD, bundlado na imagem via `.add_local_dir("LR-ASD", ...)`) pra descobrir quem está falando em cada frame.
3. Gera um vídeo vertical 1080x1920, seguindo o rosto (crop) ou com fundo desfocado (resize) quando não há rosto detectado com confiança.
4. Queima as legendas (fonte Anton, via ffmpeg + ASS) e sobe o resultado pro R2.

Classe `ClipProcessor` (`@app.cls(gpu="A10G", ...)`), GPU: A10G. Chamado a partir de `create-project.task.ts`, uma vez por melhor momento (loop no Node, não no Python).

Secret do Modal: `mintly-clip-processor-secret` (`R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`).

### `transcribe_audio.py` — `mintly-transcribe-audio`

Transcrição de áudio via **WhisperX** (substituiu um serviço equivalente no Replicate). Recebe uma URL de áudio, roda transcrição + alinhamento de palavras (e diarização opcional), envia o resultado pra `callback_url`.

Classe `WhisperXService` (`@app.cls(gpu="A10G", ...)`). Os pesos do modelo ficam num `modal.Volume` (`whisperx-models`) montado em `/cache`, pra não baixar de novo a cada cold start — **importante**: `HF_HOME`/`TORCH_HOME` precisam ser setados *antes* de importar `whisperx` (feito em `@modal.enter()`), senão o download de modelo ignora o Volume.

Secret do Modal: `mintly-transcribe-audio-secret` (`HF_TOKEN`, necessário só quando `diarize=True` vem na request).

## Padrão: endpoint HTTP + job assíncrono + callback

Os dois serviços seguem exatamente o mesmo formato — ao criar um serviço novo aqui, replique isso:

```python
@app.cls(gpu="A10G", timeout=900, retries=0, scaledown_window=20, secrets=[...])
class MyService:
    @modal.enter()
    def setup(self):
        # inicialização única por container (clientes, modelos) — reaproveitada
        # entre invocações "quentes" do mesmo container.
        ...

    @modal.method()
    def run_job(self, request: MyRequest) -> None:
        # faz o trabalho de verdade; nunca propaga exceção pro caller —
        # captura e reporta como {"status": "ERROR", "error": str(e)} no callback.
        ...
        requests.post(request.callback_url, json=result, timeout=30)

    @modal.fastapi_endpoint(method="POST")
    def my_endpoint(self, request: MyRequest):
        self.run_job.spawn(request)  # fire-and-forget, não bloqueia a resposta HTTP
        return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content={"status": "ACCEPTED"})
```

- O endpoint HTTP responde `202` imediatamente e dispara o job via `.spawn()` — a GPU pode levar minutos, então a resposta HTTP não fica presa esperando.
- O resultado de verdade chega depois, via `POST` pro `callback_url` que o Node mandou na request — nunca via resposta HTTP síncrona.
- Erros são capturados (`try/except/finally`) e viram parte do payload do callback (`status: "ERROR"`), nunca uma exceção não tratada — quem está esperando é um webhook, não uma chamada síncrona.
- `finally` sempre limpa o diretório temporário (`shutil.rmtree(base_dir, ignore_errors=True)`).

## Padrão: custo real por chamada (GPU × tempo)

Os dois serviços cronometram a execução inteira com `time.monotonic()` (do início ao fim, sucesso ou erro — a GPU é cobrada de qualquer forma) e reportam o custo real no payload do callback:

```python
GPU_TYPE = "A10G"
GPU_PRICE_PER_SECOND_USD = {
    "T4": 0.000164,
    "L4": 0.000222,
    "A10G": 0.000306,
    "A100-40GB": 0.000583,
    "A100-80GB": 0.000694,
}  # https://modal.com/pricing — atualizar se o preço do Modal mudar

started_at = time.monotonic()
# ... trabalho ...
elapsed_seconds = time.monotonic() - started_at
result["cost"] = {
    "amount": round(elapsed_seconds * GPU_PRICE_PER_SECOND_USD[GPU_TYPE] * 100, 4),  # cents
    "currency": "usd",
}
```

Esse `cost` é o que o lado Node usa pra reportar `_cost` real no evento do Polar (`setUsage`, ver `api/src/utils/polar/set-usage.ts`) — se adicionar um serviço Modal novo que alimenta billing, replicar esse padrão em vez de inventar outro.

## Deploy

```bash
cd py
modal deploy main.py
modal deploy transcribe_audio.py
```

As URLs dos endpoints ficam no Infisical (`MODAL_URL`, `MODAL_TRANSCRIBE_AUDIO_URL`), lidas pelo Node via `getInfisicalSecret`.

## `instructions.md`

**Não é documentação de convenção** — é um log cronológico de troubleshooting da instalação *local* do LR-ASD (Windows, venv, GPU NVIDIA), útil só se for reconfigurar o ambiente de dev local do zero. `requirements.txt` é especificamente as dependências da imagem Modal do `main.py`, não do venv local (esse tem seu próprio setup, documentado no `instructions.md`).
