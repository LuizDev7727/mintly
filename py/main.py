import os
from urllib.parse import urlparse

import cv2
import requests

# ============================================================
# CONFIGURAÇÕES
# ============================================================
VIDEO_ORIGEM = "https://pub-f29546430bf245658f6122e5d0ce8ce7.r2.dev/nivo-croped.mp4"  # Pode ser URL ou caminho local, ex: "meu_video.mp4"
VIDEO_SAIDA = "saida.mp4"
CROP_SIZE = 500  # Tamanho da janela de recorte (ajuste conforme necessário)
ALPHA = 0.1  # Suavização: 0.0 = travado, 1.0 = sem suavização
VIDEO_TEMP = (
    "video_temp_baixado.mp4"  # Nome do arquivo temporário quando a origem é URL
)

# --- Otimizações de performance ---
SKIP_FRAMES = 3  # Detecta o rosto a cada N frames (reaproveita a posição nos frames intermediários). 1 = detecta em todos.
SCORE_THRESHOLD = (
    0.7  # Confiança mínima para considerar uma detecção válida (0.0 a 1.0)
)

# --- Modelo YuNet (detector de rosto baseado em rede neural) ---
MODELO_PATH = "face_detection_yunet.onnx"
MODELO_URL = "https://raw.githubusercontent.com/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"


# ============================================================
# FUNÇÃO: detecta se a origem é uma URL
# ============================================================
def eh_url(caminho):
    try:
        resultado = urlparse(caminho)
        return resultado.scheme in ("http", "https")
    except Exception:
        return False


# ============================================================
# FUNÇÃO: baixa o vídeo de uma URL para um arquivo local
# ============================================================
def baixar_video(url, caminho_local):
    print(f"Baixando vídeo de: {url}")
    resp = requests.get(url, stream=True, timeout=30)
    resp.raise_for_status()  # Lança erro se a resposta não for 200 OK

    total = int(resp.headers.get("content-length", 0))
    baixado = 0

    with open(caminho_local, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                baixado += len(chunk)
                if total > 0:
                    pct = (baixado / total) * 100
                    print(f"\rProgresso: {pct:.1f}%", end="")
    print("\nDownload concluído:", caminho_local)
    return caminho_local


# ============================================================
# FUNÇÃO: garante que o modelo YuNet está disponível localmente,
# baixando automaticamente na primeira execução caso não exista
# ============================================================
def garantir_modelo_yunet(caminho_modelo, url_modelo):
    if os.path.exists(caminho_modelo) and os.path.getsize(caminho_modelo) > 1024:
        return caminho_modelo  # já existe e parece válido (não é um arquivo vazio/corrompido)

    print("Modelo YuNet não encontrado localmente. Baixando...")
    try:
        resp = requests.get(url_modelo, stream=True, timeout=30)
        resp.raise_for_status()
        with open(caminho_modelo, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        print("Modelo baixado com sucesso:", caminho_modelo)
    except requests.exceptions.RequestException as e:
        print(f"Erro ao baixar o modelo YuNet: {e}")
        print(f"Baixe manualmente em: {url_modelo}")
        print(f"E salve como: {caminho_modelo}")
        exit(1)

    return caminho_modelo


# ============================================================
# RESOLVE A ORIGEM DO VÍDEO (URL ou arquivo local)
# ============================================================
if eh_url(VIDEO_ORIGEM):
    try:
        caminho_video = baixar_video(VIDEO_ORIGEM, VIDEO_TEMP)
    except requests.exceptions.RequestException as e:
        print(f"Erro ao baixar o vídeo: {e}")
        exit(1)
else:
    caminho_video = VIDEO_ORIGEM
    if not os.path.exists(caminho_video):
        print(f"Erro: arquivo local não encontrado em '{caminho_video}'")
        exit(1)


# ============================================================
# ABRE O VÍDEO
# ============================================================
cap = cv2.VideoCapture(caminho_video)

if not cap.isOpened():
    print(
        "Erro: não foi possível abrir o vídeo. Verifique o arquivo, a URL ou o formato (codec)."
    )
    exit(1)

fps = cap.get(cv2.CAP_PROP_FPS)
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

if fps == 0 or w == 0 or h == 0:
    print(
        "Erro: não foi possível ler as propriedades do vídeo (fps/largura/altura inválidos)."
    )
    cap.release()
    exit(1)

print(f"Vídeo aberto: {w}x{h} @ {fps:.2f}fps")


# ============================================================
# PREPARA O VÍDEO DE SAÍDA
# ============================================================
out = cv2.VideoWriter(VIDEO_SAIDA, cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))


# ============================================================
# DETECTOR DE ROSTO (YuNet — DNN, mais rápido e preciso que Haar Cascade)
# ============================================================
garantir_modelo_yunet(MODELO_PATH, MODELO_URL)

# O input_size do YuNet é fixado na criação, e usamos exatamente o tamanho
# do frame do vídeo (sem precisar reduzir manualmente, como fazíamos com o
# Haar Cascade) — o modelo já é leve e rápido o suficiente em resolução cheia.
face_detector = cv2.FaceDetectorYN.create(
    MODELO_PATH,
    "",
    (w, h),
    score_threshold=SCORE_THRESHOLD,
)


# ============================================================
# PROCESSAMENTO: DETECÇÃO + SUAVIZAÇÃO + CROP
# ============================================================
smooth_x, smooth_y = w // 2, h // 2  # Posição inicial: centro do frame
frame_count = 0

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break  # Fim do vídeo ou falha de leitura

    frame_count += 1

    # --- Detecta o rosto apenas a cada SKIP_FRAMES frames ---
    # Nos frames intermediários, reaproveita a última posição suavizada,
    # já que o rosto não se move o suficiente em poucos frames pra justificar
    # rodar a detecção novamente.
    if frame_count % SKIP_FRAMES == 0:
        _, faces = face_detector.detect(frame)

        if faces is not None and len(faces) > 0:
            # Cada linha de "faces" tem 15 valores: [x, y, w, h, ...landmarks..., score]
            # Pega o rosto com maior score de confiança
            best = max(faces, key=lambda f: f[14])
            x, y, fw, fh = best[0], best[1], best[2], best[3]

            face_cx = int(x + fw / 2)
            face_cy = int(y + fh / 2)

            # --- Suavização do movimento ---
            smooth_x = int(ALPHA * face_cx + (1 - ALPHA) * smooth_x)
            smooth_y = int(ALPHA * face_cy + (1 - ALPHA) * smooth_y)

    # Se não detectar rosto (ou o frame foi "pulado"), smooth_x/smooth_y
    # mantêm o último valor (a câmera continua na última posição suave,
    # em vez de pular pro centro ou travar)

    half = CROP_SIZE // 2

    # Garante que o crop não saia dos limites do frame
    x1 = max(0, min(smooth_x - half, w - CROP_SIZE))
    y1 = max(0, min(smooth_y - half, h - CROP_SIZE))
    x2 = x1 + CROP_SIZE
    y2 = y1 + CROP_SIZE

    output = frame[y1:y2, x1:x2]
    output = cv2.resize(output, (w, h))

    out.write(output)

    if frame_count % 100 == 0:
        print(f"Processados {frame_count} frames...")


# ============================================================
# LIMPEZA
# ============================================================
cap.release()
out.release()

# Remove o arquivo temporário baixado, se existir
if eh_url(VIDEO_ORIGEM) and os.path.exists(VIDEO_TEMP):
    os.remove(VIDEO_TEMP)
    print("Arquivo temporário removido.")

print("Processamento concluído! Vídeo salvo em:", VIDEO_SAIDA)
