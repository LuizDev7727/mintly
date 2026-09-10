# api/ — Convenções

Ver [`README.md`](./README.md) para stack, setup e scripts. Este arquivo cobre convenções de código transversais — cada subpasta relevante tem seu próprio `CLAUDE.md` mais específico (mapa abaixo); leia o mais próximo do arquivo que for editar antes de escrever código.

## Bootstrap

`server.ts` só sobe o listener HTTP; todo o registro de plugins Fastify (CORS, cookies, Swagger/Scalar em `/api/docs`, error handler) e de rotas acontece em `app.ts`. Rota nova = registrar em `app.ts`, nunca direto em `server.ts`.

## Mapa de `CLAUDE.md` por pasta

| Pasta | Cobre |
|---|---|
| `src/functions/CLAUDE.md` | Anatomia de function, params/response, paginação, `Promise.all` |
| `src/infra/http/routes/CLAUDE.md` | Padrão de rota Fastify + Zod, tracing |
| `src/infra/trigger/CLAUDE.md` | Anatomia de task, waitpoints, orquestração |
| `src/lib/CLAUDE.md` | Clientes singleton de serviços externos |
| `src/utils/CLAUDE.md` | Helpers puros |
| `src/tests/CLAUDE.md`, `src/tests/factories/CLAUDE.md` | Testes e factories |

`src/webhooks/`, `src/schemas/`, `src/errors/` (abaixo) e `src/@types/` (augmentation do Fastify, `fastify.d.ts`) ainda não têm `CLAUDE.md` próprio — são pequenos o suficiente pra caber aqui.

## Erros — padrão real (⚠️ diverge do exemplo em `functions/CLAUDE.md`)

`functions/CLAUDE.md` documenta erro como `throw Object.assign(new Error(...), { statusCode: 404 })` — **isso não é o que o código faz de verdade**. O padrão realmente implementado (`src/infra/http/routes/error-handler.ts`) é:

1. Cada erro de domínio é uma classe própria em `src/errors/<nome>.error.ts`, estendendo `Error`:
   ```ts
   export class ResourceNotFoundError extends Error {
     constructor(message?: string) {
       super(message ?? "Resource not found");
     }
   }
   ```
2. `error-handler.ts` (registrado globalmente em `app.ts`) faz `instanceof` de cada classe conhecida e mapeia pro status HTTP certo:
   ```ts
   if (error instanceof ResourceNotFoundError) {
     return reply.status(404).send({ message: error.message });
   }
   ```
3. Ao criar um erro de domínio novo: (a) criar a classe em `src/errors/`, (b) importar e adicionar o `instanceof` correspondente em `error-handler.ts`. Sem o passo (b), o erro cai no `500` genérico do fim do handler.

Nomeie o arquivo `<nome>.error.ts` (dois arquivos existentes — `organization-already-created.ts`, `user-not-belongs-to-the-organization.ts` — não seguem essa convenção; são exceção histórica, não copiar o padrão deles).

`functions/CLAUDE.md` deveria ser corrigido pra refletir isso — sinalizar pro usuário se for mexer nessa área.

## Webhooks de saída (`src/webhooks/`)

Diferente de `src/infra/trigger/` (que processa jobs internos), essa pasta entrega eventos **pra fora** — webhooks configurados pela organização (ex: "me avise quando um post for publicado").

- `webhook-event.ts` — union discriminada (Zod, por `trigger`) de todos os eventos disparáveis (`post.created`, `post.failed`, `post.posted`, `project.created`); cada payload de evento fica em `events/<evento>.ts`.
- `handle-webhook-event.ts` — assina o payload como JWT (header `Mintly-Signature`, mesmo mecanismo documentado em `docs/`), registra um log de entrega (`webhookLogsTable`, status `PENDING` → `SUCCESS`/`FAILED`) e faz o `POST` pro endpoint da organização.
- Ao adicionar um evento novo: criar `events/<evento>.ts` (schema do payload), adicionar o literal em `webhook-event.ts`, e disparar via `publish-webhook.ts`/`webhook-event-trigger.ts` no ponto do código onde o evento acontece.

Nota: `handle-webhook-event.ts` grava `ip: "asdasdasdasdasd"` hardcoded ao criar o log — é um placeholder que ficou, não captura o IP real da entrega. Vale corrigir se mexer nessa função.

## Schemas compartilhados (`src/schemas/`)

Schemas Zod usados por mais de uma rota (ex: `create-post.schema.ts`, compartilhado entre a rota HTTP e a task do Trigger.dev que processa o post). Se um schema é usado só numa rota, ele fica inline na própria rota — só sobe pra cá quando reaproveitado.

## Secrets — Infisical-first

Ao integrar um serviço externo novo, **não** adicione a credencial em `src/env.ts`/`.env` — use `getInfisicalSecret({ secretName })` (`src/utils/infisical/get-infisical-secret.ts`) e adicione a chave no tipo `Env` local desse arquivo. `env.ts` (raiz de `src/`) é só pro essencial de boot (porta, ambiente, credenciais do próprio Infisical) — ver `README.md`.
