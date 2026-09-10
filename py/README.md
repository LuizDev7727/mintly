# Mintly — Serviços Modal

Serviços Python que rodam com GPU sob demanda na [Modal](https://modal.com), fora do processo principal da API. Cada arquivo é um app Modal independente, com deploy próprio, chamado via HTTP a partir do backend Node (`api/`).

| Serviço | App Modal | O que faz |
|---|---|---|
| `main.py` | `mintly-clip-processor` | Corta um clipe do vídeo original, roda active-speaker-detection (LR-ASD), gera um vídeo vertical 1080x1920 (crop no rosto ou fundo desfocado), queima legendas e sobe pro R2. |
| `transcribe_audio.py` | `mintly-transcribe-audio` | Transcreve áudio com WhisperX (transcrição + alinhamento de palavras + diarização opcional). |

Os dois seguem o mesmo formato: recebem uma request com `callback_url`, respondem `202` na hora, processam em background e enviam o resultado via `POST` pro callback quando terminam — incluindo o custo real da chamada (segundos de GPU × preço), usado pro billing no Polar do lado da API.

Convenções de código, padrões de implementação e detalhes de arquitetura estão documentados em [`CLAUDE.md`](./CLAUDE.md).

## Pré-requisitos

- Python 3.10+ (ambiente local só é necessário para testar/depurar `main.py` localmente com o LR-ASD — o deploy em si roda na infraestrutura da Modal)
- [Modal CLI](https://modal.com/docs/guide) configurado e autenticado (`modal token new`)
- ffmpeg instalado no sistema (para testes locais)

## Deploy

```bash
cd py
modal deploy main.py
modal deploy transcribe_audio.py
```

Cada deploy sobe uma imagem Docker nova pra Modal e atualiza o endpoint HTTP correspondente. As URLs geradas devem ser cadastradas no Infisical como `MODAL_URL` (clip processor) e `MODAL_TRANSCRIBE_AUDIO_URL` (transcrição).

## Secrets necessários (Modal)

| Secret | Usado por | Chaves |
|---|---|---|
| `mintly-clip-processor-secret` | `main.py` | `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` |
| `mintly-transcribe-audio-secret` | `transcribe_audio.py` | `HF_TOKEN` (só necessário quando a request pede diarização) |

Configurados via `modal secret create <nome> <chave>=<valor> ...` ou pelo dashboard da Modal.

## Estrutura

```
py/
├── main.py               # clip processor (Modal)
├── transcribe_audio.py   # transcrição via WhisperX (Modal)
├── requirements.txt      # dependências da imagem Modal do main.py
├── LR-ASD/                # repositório de active-speaker-detection (dependência do main.py)
├── instructions.md        # log de troubleshooting do setup local do LR-ASD (Windows/GPU)
├── venv/                  # ambiente virtual local, só para testes do LR-ASD
└── CLAUDE.md              # convenções e padrões de implementação
```

## Setup local do LR-ASD

Só necessário se for testar/depurar o `main.py` localmente, fora da Modal. O passo a passo completo — incluindo os problemas já enfrentados e suas correções (versões de dependências, pesos de modelo, paths) — está em [`instructions.md`](./instructions.md).
