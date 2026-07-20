# Upload retomável de posts

## Problema

Ao criar um post (`web/src/pages/orgs/$slug/channels/$channel/create-upload/-components/create-post-form.tsx`), vídeos grandes são enviados ao Cloudflare R2 via S3 Multipart Upload (arquivos acima de 100MB, partes de 10MB). Antes desta mudança, se a internet do usuário caísse no meio do upload ou a página desse refresh, o upload recomeçava do zero — mesmo o R2 já tendo recebido várias partes do arquivo — porque `key`, `uploadId` e as partes já enviadas viviam só em variáveis locais de `uploadFile()`.

Separadamente, `abortMultipartUploadHttp` já existia mas era código morto: `handleCancelUpload` só dava `abort()` no lado do navegador e nunca avisava o R2, então uploads cancelados deixavam partes órfãs ocupando espaço no bucket.

## Restrição de navegador que molda o design

O conteúdo de um `File` não sobrevive a um refresh de página — não existe API que reconstrua um arquivo sozinha sem o usuário re-selecionar/re-arrastar. Por isso a retomada não é 100% automática após um refresh: o que é persistido é só o *metadado* do upload (`key`/`uploadId`), indexado por `{fileName, fileSize, lastModified}`. Quando o usuário re-seleciona o mesmo arquivo, o sistema detecta o match e continua de onde parou em vez de recomeçar. Dentro da mesma sessão (queda de conexão sem refresh), a retomada é totalmente transparente, já que a identidade do arquivo em memória ainda bate.

## R2 como fonte da verdade

Em vez de confiar no que o navegador acha que já foi enviado, cada tentativa de retomada pergunta ao R2 o que realmente está lá, via `ListPartsCommand`. Isso importa justamente porque o cenário que este recurso ataca é o de conexão instável — é exatamente aí que o cliente pode achar que uma parte subiu (recebeu um 200) sem ter certeza de que o objeto foi durabilizado, ou perder o resultado da chamada antes de registrar o sucesso localmente.

O `localStorage` funciona só como um índice leve: "existe um candidato `{key, uploadId}` pra esse arquivo, vale a pena perguntar pro R2?". Ele nunca é tratado como fonte confiável de quais partes realmente existem.

## Backend

### `api/src/utils/cloudflare/list-multipart-upload-parts.ts` (novo)
`listMultipartUploadParts({ key, uploadId })` usa `ListPartsCommand` e devolve `{ parts: { partNumber, eTag, size }[] }`. Implementado com paginação (`PartNumberMarker` / `IsTruncated` / `NextPartNumberMarker`), porque o S3/R2 limita `ListParts` a 1000 resultados por chamada (10GB a 10MB por parte) — sem paginar, arquivos grandes teriam partes reportadas incorretamente.

### `GET /api/uploads/list-parts` (nova rota)
`api/src/infra/http/routes/upload/list-multipart-upload-parts.route.ts`, com querystring `{key, uploadId}` validada via Zod. Registrada em `api/src/app.ts`. Se o R2 lançar erro (ex: `NoSuchUpload` para um upload expirado/já finalizado), o erro simplesmente propaga — quem decide o que fazer com isso é o frontend.

### `generate-upload-signed-urls.ts` (estendido)
Ganhou um parâmetro opcional:
```ts
resume?: { key: string; uploadId: string; partNumbers: number[] }
```
Quando presente, pula o `CreateMultipartUploadCommand` (não cria um upload novo) e reassina URLs (`UploadPartCommand`) só para os `partNumbers` informados, reaproveitando o `key`/`uploadId` existentes. Os números das partes retornados são os mesmos passados em `partNumbers` — nunca renumerados — porque o frontend calcula o range de bytes de cada parte a partir do `partNumber` (`(partNumber - 1) * PART_SIZE`).

`presign-upload.route.ts` só repassa esse campo opcional do body para a função.

## Frontend

### `web/src/storage/resumable-upload-storage.ts` (novo)
Armazena, em um único array no `localStorage`, registros:
```ts
type ResumableUploadRecord = {
  key: string;
  uploadId: string;
  fileName: string;
  fileSize: number;
  fileLastModified: number;
  updatedAt: number;
};
```
Como o R2 é a fonte da verdade para o progresso, os registros só precisam guardar identidade (não as partes em si). Expõe `findResumableUpload`, `saveResumableUpload` e `removeResumableUpload`. Registros com mais de 24h são ignorados/expurgados (defesa contra crescimento indefinido e contra tentar retomar uploads que o R2 provavelmente já descartou).

### `web/src/http/upload/list-multipart-upload-parts.http.ts` (novo)
Cliente HTTP padrão para `GET /uploads/list-parts`.

### `web/src/utils/upload-file.ts` (reescrito)
Fluxo de `uploadFile()`:
1. Monta a "impressão digital" do arquivo (`nome + tamanho + lastModified`).
2. Se essa impressão digital não estiver "reivindicada" nesta sessão (ver trava abaixo), procura um registro correspondente via `findResumableUpload`.
3. Se achar um registro: chama `list-parts` para confirmar com o R2 quais partes realmente existem.
   - Se a chamada falhar (uploadId inválido, já completado, abortado ou expirado em outro lugar), descarta o registro local (`removeResumableUpload`) e segue com um upload novo do zero — uma retomada quebrada nunca deve deixar o upload pior do que sem retomada.
   - Se tiver sucesso, calcula quais números de parte ainda faltam e pede URLs assinadas só para essas (via `resume`), e "semeia" a barra de progresso com o tamanho das partes já confirmadas (evitando o salto de 0% direto pra 80%, por exemplo).
4. Se não achar registro: assina normalmente como antes, mas agora salva `{key, uploadId, ...}` no `localStorage` **antes** de subir qualquer parte — assim, mesmo uma queda logo na primeira parte já é retomável.
5. Depois de cada parte enviada com sucesso, e ao completar o upload inteiro (`completeMultipartUploadHttp`), o registro é atualizado/removido conforme o caso. Em caso de erro ou cancelamento, o registro é mantido — é o que permite a retomada.

**Trava de concorrência (`claimedFingerprints`)**: um `Set` em memória, por sessão, evita que dois posts referenciando o mesmo arquivo tentem retomar o mesmo `uploadId` ao mesmo tempo (o que faria o `completeMultipartUpload` de um deles falhar com `NoSuchUpload`, já que o R2 invalida o uploadId assim que ele é completado).

### `handleCancelUpload` em `create-post-form.tsx` (atualizado)
Além do `abortController.abort()` (que já existia), agora busca o registro retomável daquele arquivo e, se encontrar, chama `abortMultipartUploadHttp({key, uploadId})` de verdade e remove o registro do `localStorage`.

## Cancelar não é pausar

Isso é intencional: `abortMultipartUploadHttp` manda o R2 **apagar** as partes já enviadas daquele upload — era exatamente o vazamento que o recurso corrige (uploads cancelados ficando órfãos no bucket). Por isso, depois de cancelar, não sobra nada no R2 para retomar; re-selecionar o mesmo arquivo começa um upload novo do zero, corretamente.

A retomada existe para **interrupção não intencional** (queda de conexão, refresh de página) — não para o clique deliberado em "Cancelar".

## Fora de escopo (deliberadamente)

- Indicador visual de "retomada detectada" — a retomada é transparente; se não achar registro, degrada silenciosamente para o comportamento normal.
- File System Access API / handles persistentes de arquivo — complexidade desnecessária dado que a abordagem por `localStorage` + re-seleção já resolve o problema.
- Testes automatizados — não existem testes para upload hoje; a verificação é manual.

## Como testar manualmente

1. Suba um upload de arquivo grande (> 100MB). No Network do devtools, confirme os PUTs multipart com números de parte sequenciais.
2. No meio do upload, jogue a conexão pra Offline (ou dê refresh na página) — **sem clicar em Cancelar**.
3. Re-selecione/arraste o **mesmo arquivo**.
4. No Network, confirme: uma chamada `GET /uploads/list-parts`, seguida de `POST /uploads/presign` com um corpo `resume` pedindo só as partes faltantes — as partes já enviadas não devem ser reenviadas. A barra de progresso deve começar próxima de onde parou, não em 0%.
5. Deixe terminar — confirme que `POST /uploads/complete-multipart` dispara e o post é criado.
6. Repita com um arquivo novo, mas dessa vez clique em Cancelar no meio do upload — confirme que `POST /uploads/abort-multipart` dispara e que o registro no `localStorage` (aba Application → Local Storage) é removido.
7. Confirme que o caminho de arquivo pequeno (< 100MB, PUT único) não foi afetado — nenhuma chamada relacionada a retomada deve ocorrer.
8. Opcional: edite manualmente o `uploadId` de um registro no `localStorage` para um valor inválido, re-selecione o arquivo correspondente e confirme que o sistema cai de volta para um upload novo em vez de falhar.

## Arquivos alterados/criados

- `api/src/utils/cloudflare/generate-upload-signed-urls.ts`
- `api/src/utils/cloudflare/list-multipart-upload-parts.ts` (novo)
- `api/src/infra/http/routes/upload/presign-upload.route.ts`
- `api/src/infra/http/routes/upload/list-multipart-upload-parts.route.ts` (novo)
- `api/src/app.ts`
- `web/src/http/upload/presign-upload.http.ts`
- `web/src/http/upload/list-multipart-upload-parts.http.ts` (novo)
- `web/src/storage/resumable-upload-storage.ts` (novo)
- `web/src/utils/upload-file.ts`
- `web/src/pages/orgs/$slug/channels/$channel/create-upload/-components/create-post-form.tsx`
