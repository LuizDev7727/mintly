# Mintly — Glossário de domínio

Vocabulário e regras do domínio, para não redescobrir o que cada coisa é. Só o que **não dá para inferir lendo um arquivo** — para convenções de código veja os `CLAUDE.md` de cada pasta. Se algo aqui divergir do código, o código vence: corrija este arquivo.

## Entidades

| Termo | O que é | O que **não** é |
|---|---|---|
| **Organização** (`organizations`) | O tenant. Identificada em todo o código pelo `slug` (`orgSlug`, `organizationSlug`). Tem `plan` (`free` \| `pro`), API key para a API externa e um customer no Polar (`polarCustomerId`; `externalCustomerId` = slug). | Um usuário. Usuários pertencem a organizações via `members`. |
| **Membro / Convite** | `members.role` é texto: `owner` (quem criou a org) ou `member` (padrão). `invitations` guarda `role` livre e `status` (`pending` por padrão). | Um papel com permissões granulares — só existe owner/member. |
| **Canal** (`channels`) | Pertence a **uma** organização (`organizationSlug`). Agrupa projetos, posts, pastas, integrações e thumbnails de inspiração. `description` é obrigatória na criação. | Um canal do YouTube — é o espaço de trabalho dentro do Mintly. |
| **Projeto** (`projects`) | Um vídeo-fonte enviado, do qual o sistema detecta os *best moments* e renderiza clipes. Status: `ENCODING` (**padrão de todo projeto novo**) → `PROCESSING` → `SUCCESS` / `ERROR` / `CANCELED`. Pertence a um canal, **não** a uma pasta. | Um post. Não tem `SCHEDULED` nem `PUBLISHED`. |
| **Best moment / clipe** (`best_moments`) | Um trecho gerado de um projeto (`title`, `storageKey`, `projectId`). Apagado junto com o projeto (cascade). | Um post: só vira post se alguém o publicar. |
| **Post** (`posts`) | Um vídeo a ser publicado nas redes, com título/descrição/SEO, thumbnail opcional e agendamento opcional (`scheduledTo`). Vai para redes via `socials_to_post` (`YOUTUBE` \| `TIKTOK` \| `INSTAGRAM`). Pode estar dentro de uma pasta. | Um projeto. Tem 11 status próprios (ver pipeline). |
| **Pasta** (`folders`) | Organiza **posts** dentro de um canal, em árvore (`parentId`). Post sem `folderId` está na raiz do canal. | Agrupador de projetos — projetos não têm pasta. |
| **Integração** (`integrations`) | Conexão OAuth de um canal com `YOUTUBE`, `TIKTOK` ou `INSTAGRAM` (guarda access/refresh token). | Login do usuário no Mintly (esse é o `better-auth`). |
| **Thumbnail de inspiração** | Imagem de referência enviada por um canal. | Thumbnail de um post. |
| **Atividade** (`activities`) | Feed de eventos da organização (`CREATED_POST`, `ADDED_INTEGRATION`, …), com autor. | Log técnico ou de erro. |
| **Webhook de saída** (`webhooks`) | Configurado pela organização; eventos `post.created`, `post.failed`, `post.posted`, `project.created`. Assinado como JWT no header `Mintly-Signature`; cada entrega gera um `webhook_logs` (`PENDING` → `SUCCESS` \| `FAILED`). | Webhook de entrada (ex.: callback do Modal), que é um waitpoint do Trigger.dev. |
| **API key externa** | Chave por organização que autentica `/api/v1/*` (`checkApiKey` preenche `request.organization`). | Sessão de usuário. |

## Pipelines assíncronos (Trigger.dev, `api/src/infra/trigger/`)

O `status` do registro é escrito pela própria task (junto com `metadata.set("status", …)`), e o `runId` só é gravado quando a task inicia — por isso `runId` é sempre string em listagens.

- **Projeto** (`create-project`): `ENCODING` (converte vídeo em mp3) → `PROCESSING` (transcreve; o Gemini detecta os best moments; **para cada clipe** a task cria um waitpoint, dispara o render no Modal e espera o callback) → `SUCCESS`. Falha → `ERROR`; cancelamento → `CANCELED`.
- **Post** (`process-post`): `PROCESSING` → (`SCHEDULED`, aguardando `wait.until` a data) → `ENCODING` → `TRANSCRIBING` → `SEO_GENERATING` → (`GENERATING_THUMBNAIL`, opcional) → `PUBLISHING` → `PUBLISHED`. Publica em YouTube/TikTok/Instagram por tasks `upload-post-to-*`.
- **Realtime token** (`generateRealtimeToken`) só é gerado para status "ativos", e a definição difere: em **projetos** só `ENCODING`; em **posts** `PROCESSING`, `ENCODING`, `TRANSCRIBING`, `SEO_GENERATING`, `GENERATING_METADATA`, `GENERATING_THUMBNAIL` e `PUBLISHING`. Nos demais status o campo é `null`.

## Billing (Polar, usage-based)

- Organização = customer do Polar. O uso é reportado com `setUsage` (`api/src/utils/polar/set-usage.ts`), com o custo real em `metadata._cost`.
- Eventos emitidos hoje: `best_moments_generated` (uma vez por projeto) e `clip_rendered` (**uma vez por clipe renderizado**), ambos em `create-project`; `seo_generated` (`seo-enrichment`); `audio_transcribed` (`transcribe-audio`).
- `thumbnail_generated` está **declarado** (`set-usage.ts`) e faz parte da série que `get-usage` devolve, mas **nenhuma task o emite** hoje.
- Existe uma lista de organizações isentas (`ORGANIZATIONS_TO_NOT_BILL`) que só vale em produção.
- Uma task que reexecuta (retry) não pode emitir o mesmo evento duas vezes.

## Regras que não são óbvias

- **Toda query é escopada pela organização.** Recurso que vem por `channelId` precisa ser conferido contra a organização do chamador; não confie só no id.
- Enums de status de projeto e de post são **diferentes** — não copie um para o outro (já causou erro de resposta na API externa).
- Migrations existentes em `api/drizzle/migrations/` nunca são editadas: schema novo = migration nova (`pnpm db:generate`).

## Onde as coisas ficam no `web/`

`/orgs/$slug/…` → `channels/`, `members/`, `activities/`, `usage/`, `webhooks/`, `settings/`. Dentro de um canal (`channels/$channel/…`): `projects/`, `create-upload/`, `integrations/`, `ai/`, `settings/` e `$postId` (detalhe do post).
