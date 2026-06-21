# Setup do LR-ASD (Windows + GPU NVIDIA local) — registro de correções

Este documento lista, em ordem cronológica, todos os problemas encontrados ao configurar e rodar o [LR-ASD](https://github.com/Junhua-Liao/LR-ASD) localmente, e a correção aplicada para cada um. Ambiente: Windows, Python 3.12, venv, GPU NVIDIA com driver CUDA 13.1.

---

## 1. Setup inicial de ambiente

```bash
python -m venv venv
venv\Scripts\activate
```

### PyTorch com suporte a CUDA

Identificado via `nvidia-smi` que o driver suporta até CUDA 13.1. Instalado com build compatível:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

Confirmado com:

```bash
python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0))"
```

### Demais dependências Python

```bash
pip install opencv-python numpy scipy scikit-learn python_speech_features scenedetect tqdm
```

### ffmpeg

Instalado no sistema (não é pacote pip) e confirmado com `ffmpeg -version`.

### Clonar o repositório

```bash
git clone https://github.com/Junhua-Liao/LR-ASD.git
cd LR-ASD
```

Os pesos do modelo principal (ASD) já vêm incluídos na pasta `weight/` do repositório — não precisa baixar nada para isso.

---

## 2. Erro: `ModuleNotFoundError: No module named 'scenedetect.video_manager'`

**Causa:** o `pip install scenedetect` (sem versão fixada) instalou a versão mais recente (0.7), que removeu o módulo `scenedetect.video_manager` na reestruturação da API (a partir da série 0.6). O `Columbia_test.py` foi escrito para a API antiga (0.5.x).

**Correção:**

```bash
pip uninstall scenedetect -y
pip install scenedetect==0.5.6.1
```

Importante: confirme com `pip show scenedetect` que a versão realmente trocou — em alguns casos o pip pode não substituir corretamente na primeira tentativa.

---

## 3. Erro: `ModuleNotFoundError: No module named 'pandas'`

**Causa:** dependência transitiva não declarada explicitamente (usada internamente pelo `scenedetect` 0.5.6.1 ou outro pacote do pipeline).

**Correção:**

```bash
pip install pandas
```

---

## 4. Erro: `FileNotFoundError: ...s3fd/sfd_face.pth`

**Causa:** o peso do detector de rosto S3FD (usado internamente pelo LR-ASD para localizar rostos antes da detecção de fala ativa) não vem versionado no repositório Git. O código tenta baixá-lo automaticamente via `gdown` (Google Drive), mas esse download falhou silenciosamente.

**Correção aplicada:**

```bash
pip install gdown
```

Como o download automático ainda não funcionou, o arquivo foi **baixado manualmente** do Google Drive e colocado em:

```
LR-ASD\model\faceDetector\s3fd\sfd_face.pth
```

Link de download (Google Drive):

```
https://drive.google.com/uc?id=1KafnHz7ccT-3IyddBsL5yi2xGtxAKypt
```

Esse ID de arquivo é o mesmo usado pelo repositório original em que o LR-ASD se baseia (TaoRuijie/TalkNet-ASD), que reutiliza a mesma estrutura de detector de rosto S3FD. Tamanho aproximado do arquivo: 85-90 MB.

Depois de confirmado que o arquivo estava no lugar certo e a execução funcionando, o `gdown` foi desinstalado (não é mais necessário, já que só serve para esse download pontual):

```bash
pip uninstall gdown -y
```

---

## 5. Erro: `AttributeError: module 'numpy' has no attribute 'int'`

**Causa:** o código usa `np.int` como alias para o `int` nativo do Python. Esse alias foi descontinuado no NumPy 1.20 e **removido** a partir do NumPy 1.24+. Como o ambiente tinha uma versão recente do NumPy instalada, o alias não existe mais.

**Tentativa que NÃO funcionou:** fazer downgrade do NumPy (`pip install "numpy<1.24"`) falhou, porque essas versões antigas do NumPy não têm wheels pré-compilados para Python 3.12 — o pip tentou compilar do código-fonte e isso quebrou por incompatibilidade entre `setuptools`/`pkg_resources` e `pkgutil.ImpImporter` (removido no Python 3.12).

**Correção real aplicada:** editar o código-fonte do LR-ASD diretamente, no arquivo:

```
LR-ASD\model\faceDetector\s3fd\box_utils.py
```

Na linha 38, trocado:

```python
# Antes
return np.array(keep).astype(np.int)

# Depois
return np.array(keep).astype(int)
```

**Nota:** repositórios antigos como esse costumam ter mais de uma ocorrência de aliases removidos do NumPy (`np.int`, `np.float`, `np.bool`, etc.) espalhadas pelo código. Se o mesmo tipo de erro aparecer em outro arquivo, aplicar a mesma correção (remover o prefixo `np.`) no local indicado pelo traceback.

---

## 6. Erro: caminho duplicado ao ler arquivo de áudio (`.wav` não encontrado)

Erro observado:
```
FileNotFoundError: ...\mintly-croped-new\pycrop\..\mintly-croped-new\pycrop\00000.wav
```

**Causa:** o comando foi executado passando `--videoFolder ..` (caminho relativo usando `..` para "pasta acima"). Em algum ponto do pipeline, o script combina esse caminho relativo mais de uma vez via `os.path.join()`, duplicando o trecho `..\mintly-croped-new\pycrop\` no caminho final.

**Correção:** usar caminho **absoluto** em vez de relativo no `--videoFolder`, e remover a pasta de resultados parciais gerada pela execução com erro antes de rodar de novo (para não misturar arquivos de duas execuções):

```bash
rmdir /s /q D:\projects\mintly\py\mintly-croped-new

cd D:\projects\mintly\py\LR-ASD
python Columbia_test.py --videoName mintly-croped-new --videoFolder D:\projects\mintly\py
```

---

## Comando final que funcionou

Estrutura de pastas:

```
D:\projects\mintly\py\
├── LR-ASD\                  (repositório clonado)
├── venv\
├── main.py
└── mintly-croped-new.mp4       (vídeo de teste, gerado via corte com ffmpeg)
```

Comando de corte do vídeo original (recodificado, para evitar o problema de "vídeo congelado" que acontece com `-c copy` quando o corte não cai num keyframe):

```bash
ffmpeg -ss 00:00:10 -i video_original.mp4 -t 15 -c:v libx264 -c:a aac mintly-croped-new.mp4
```

Comando de execução do LR-ASD:

```bash
cd D:\projects\mintly\py\LR-ASD
python Columbia_test.py --videoName mintly-croped-new --videoFolder D:\projects\mintly\py
```

Resultado gerado em:

```
D:\projects\mintly\py\mintly-croped-new\pyavi\video_out.avi
```

Vídeo anotado com caixas verdes (rosto detectado como "falando") e vermelhas (não falando), frame a frame.

---

## Resumo rápido de todos os comandos de correção, em ordem

```bash
# Scenedetect: downgrade para API compatível
pip uninstall scenedetect -y
pip install scenedetect==0.5.6.1

# Dependência faltante
pip install pandas

# Peso do S3FD (download manual necessário)
# Download manual de sfd_face.pth (Google Drive):
# https://drive.google.com/uc?id=1KafnHz7ccT-3IyddBsL5yi2xGtxAKypt
# Salvar em: model/faceDetector/s3fd/sfd_face.pth
pip uninstall gdown -y

# numpy: editar manualmente model/faceDetector/s3fd/box_utils.py linha 38
# np.array(keep).astype(np.int)  →  np.array(keep).astype(int)

# Execução: sempre usar caminho absoluto em --videoFolder, nunca relativo com ".."
# Columbia_test.py --videoName video-name --videoFolder D:\folder_path_that_contains_video
```
