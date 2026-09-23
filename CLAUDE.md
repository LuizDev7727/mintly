# Mintly — Claude Instructions

## Git Flow

Este projeto segue Git Flow estrito. **Nunca crie PRs diretamente para `main`.**

```
feature/* → development → staging → main
```

- **Features e fixes**: abrir PR de `feature/*` para `development`
- **Release**: abrir PR de `development` para `staging`
- **Deploy**: abrir PR de `staging` para `main`

Ao criar qualquer PR com `gh pr create`, sempre passar `--base development` (ou a branch correta do fluxo). Nunca omitir `--base` para evitar que o GitHub use `main` como padrão.

Essas regras são **aplicadas por um hook**, não só por texto: `.claude/hooks/git-flow-guard.mjs` (registrado em `.claude/settings.json`) bloqueia `git commit` em `main`/`staging`/`development`, `git push` para essas branches, force push, e `gh pr create` sem `--base` ou com base fora do fluxo. Se um comando for bloqueado, a mensagem diz o que fazer — não tente contornar o hook. Testes do hook: `node --test .claude/hooks/git-flow-guard.test.mjs`.

## Domínio e revisão

- **`CONTEXT.md`** — glossário do domínio (organização, canal, projeto, post, pipelines, billing) com o que cada coisa é e não é. Leia antes de mexer em pipelines, billing ou modelagem de dados.
- **`/mintly-review`** — revisão read-only do diff contra `development` com revisores independentes em paralelo (isolamento entre organizações, segurança, requisitos, convenções, regressão, pipelines/billing, performance). Rode antes de abrir um PR.

## Estrutura do Monorepo

Cada pasta na raiz é um projeto independente, com seu próprio `package.json`/lockfile. Não é um workspace único — não assuma que uma dependência instalada numa pasta está disponível em outra.

### `api/`

Backend principal. **Fastify** + **Drizzle ORM** (Postgres) + **Zod** para validação, com **Trigger.dev** (`src/infra/trigger/`) orquestrando os pipelines assíncronos (conversão de vídeo, transcrição via Modal, detecção de melhores momentos via Gemini, renderização de clipes). Billing usage-based via **Polar.sh** (`src/lib/polar.ts`, `src/functions/organization/`), com organização = customer do Polar. Cada domínio (`src/functions/<recurso>/`, `src/infra/http/routes/internal/<recurso>/`) tem seu próprio `CLAUDE.md` com convenções detalhadas — sempre ler o mais específico antes de editar.

### `web/`

Frontend principal (o produto em si). **React** + **TanStack Router** (rotas por arquivo, `src/pages/`) + **TanStack Query** + Tailwind/shadcn. Convenções de rota, formulário (`form-pattern`) e query params (`nuqs`) documentadas como skills em `web/.claude/skills/`.

### `py/`

Serviços Python hospedados no **Modal** (GPU sob demanda), fora do pipeline principal da API — chamados via webhook a partir de tasks do Trigger.dev. `main.py`: corta o clipe, roda active-speaker-detection (LR-ASD), gera vídeo vertical com legenda. `transcribe_audio.py`: transcrição via WhisperX. Ambos reportam o custo real da chamada (GPU × tempo) de volta pro Node via `cost` no callback, usado no billing (`_cost` metadata dos eventos do Polar).

### `docs/`

Documentação pública da API e dos webhooks (Next.js, roda na porta 3001 via `pnpm dev`). Layout estilo Stripe/API-reference (sidebar, blocos de código, exemplos de request/response por status). Conteúdo é JSX escrito à mão por página (`src/app/**/page.tsx`), não MDX. Hoje tem 1 endpoint documentado (`get-projects`) e a seção de webhooks (getting started + eventos). Ver `docs/README.md`.

### `www/`

Site institucional/marketing (Next.js + MDX + Radix + Tailwind). Internacionalizado via segmento dinâmico `[lang]` (`src/app/[lang]/`, dicionários em `src/dictionaries/`). Tem seções de blog e changelog em MDX (`(posts)`/`(entries)`, route groups).

### `mcp/`

Servidor **MCP** (Model Context Protocol) próprio do Mintly, rodando via stdio (`@modelcontextprotocol/server`). Expõe a API do Mintly como tools pra agentes de IA — hoje só tem `get-projects-tool` (lista projetos de um canal). Cada tool fica em `src/tools/`, com contrato de output em `src/contracts/`. `mcp/.mcp.json` é só um **exemplo** de registro do servidor num cliente MCP (não é carregado ao abrir o repo); precisa de `MINTLY_API_KEY`/`MINTLY_API_URL` no ambiente.

### MCPs do projeto (`.mcp.json` na raiz)

Só o **Playwright MCP** (`@playwright/mcp`), usado para o agente abrir o app no browser e provar que uma mudança de tela funciona — ver "Validação no browser" em `web/CLAUDE.md`. A entrada usa `cmd /c npx` porque o projeto é desenvolvido em Windows nativo; em macOS/Linux troque por `"command": "npx"`. Usa `--browser msedge` porque o padrão do MCP exige o Google Chrome instalado no sistema, e o Edge já vem no Windows (perfil temporário, sem download); se preferir o Chrome, instale-o e remova a flag. O MCP grava snapshots em `.playwright-mcp/` no diretório em que roda — está no `.gitignore`.

### `infra/`

Infraestrutura como código via **Pulumi** (TypeScript, provider AWS). `index.ts` provisiona o ambiente de staging da API: ECS Fargate (cluster, task definition, service), ECR, IAM role de execução, security group. Não é mais o template genérico do Pulumi — já foi customizado especificamente pro deploy do `api/`.
