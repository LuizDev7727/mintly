# Mintly — API

Backend principal do Mintly. **Fastify** + **Zod** (validação e tipagem end-to-end via `fastify-type-provider-zod`) + **Drizzle ORM** (Postgres), com **Trigger.dev** orquestrando os pipelines assíncronos de processamento de vídeo/áudio e **Polar.sh** cuidando de billing usage-based por organização.

## Stack

- **Fastify 5** — HTTP server, rotas em `src/infra/http/routes/`
- **Drizzle ORM** (Postgres) — schema em `src/infra/db/tables/`
- **Zod** — validação de rotas e schema das tasks do Trigger.dev
- **Trigger.dev v4** — pipelines assíncronos (conversão de vídeo, transcrição, geração de melhores momentos, renderização de clipes)
- **better-auth** — autenticação (sessão via cookie, OAuth Google)
- **Polar.sh** (`@polar-sh/sdk`) — billing por organização (organização = customer do Polar)
- **Infisical** — gerenciamento de secrets de terceiros em runtime (ver seção abaixo)
- **Vitest** — testes

## Setup

```bash
cd api
pnpm install
cp .env.example .env   # preencher com valores reais
pnpm db:migrate
pnpm dev
```

Servidor sobe em `http://localhost:3000` (configurável via `PORT`).

## Variáveis de ambiente

`src/env.ts` só valida o essencial pra subir o processo: `NODE_ENV`, `PORT` e as credenciais do Infisical (`INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`, `INFISICAL_PROJECT_ID`, `INFISICAL_ENVIRONMENT`).

**A maioria dos secrets de terceiros (Polar, Gemini, R2, Modal, Resend, TikTok, Instagram, QStash, etc.) não vem de `.env`** — são buscados em runtime via `getInfisicalSecret({ secretName })` (`src/utils/infisical/get-infisical-secret.ts`), a partir do projeto/ambiente configurado no Infisical. `.env.example` lista um conjunto mais amplo de variáveis históricas; nem todas são lidas via `process.env` diretamente hoje — ao adicionar uma integração nova, prefira o padrão Infisical em vez de uma env var nova.

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o servidor com hot reload (`tsx watch`) |
| `pnpm build` | Build de produção (`tsdown`) |
| `pnpm db:generate` | Gera uma migration a partir de mudanças no schema Drizzle |
| `pnpm db:migrate` | Aplica migrations pendentes |
| `pnpm db:ui` | Abre o Drizzle Studio |
| `pnpm db:seed` | Popula o banco com dados de seed |
| `pnpm test` / `pnpm test:ui` | Roda os testes (Vitest) |
| `pnpm trigger:dev` | Sobe o dev server do Trigger.dev (processo separado, necessário pra rodar as tasks localmente) |

Pra rodar o pipeline completo em dev, `pnpm dev` e `pnpm trigger:dev` precisam estar rodando ao mesmo tempo, em terminais separados.

## Documentação da API (interativa)

Com o servidor rodando, `/api/docs` serve uma referência interativa (Scalar) gerada a partir dos schemas Zod de cada rota — não precisa manter documentação de endpoint separada à mão.

## Estrutura

```
src/
├── server.ts                # entrypoint
├── app.ts                    # registro de plugins Fastify e todas as rotas
├── env.ts                     # validação das env vars de boot (Infisical + PORT)
├── functions/                  # lógica de negócio pura, por domínio — ver functions/CLAUDE.md
├── infra/
│   ├── db/                      # client Drizzle + tabelas (tables/) + migrations
│   ├── http/                     # rotas Fastify (routes/internal/<recurso>/) + middleware — ver infra/http/routes/CLAUDE.md
│   └── trigger/                   # tasks do Trigger.dev — ver infra/trigger/CLAUDE.md
├── lib/                          # clientes singleton de serviços externos (auth, r2, polar, google, replicate) — ver lib/CLAUDE.md
├── utils/                         # helpers puros sem estado — ver utils/CLAUDE.md
├── webhooks/                       # handlers de webhooks recebidos (ex: eventos externos)
├── schemas/                         # schemas Zod compartilhados entre rotas
└── tests/                            # factories e testes de rota (http/)
```

Vários subdiretórios têm seu próprio `CLAUDE.md` com convenções específicas (nomenclatura, anatomia de arquivo, padrões) — sempre ler o mais próximo do arquivo que for editar antes de escrever código novo.
