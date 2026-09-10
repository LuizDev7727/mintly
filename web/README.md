# Mintly — Web

Frontend principal do Mintly (o produto em si — dashboard de organizações, canais, posts, projetos, billing/usage). **React 19** + **Vite** + **TanStack Router** (rotas por arquivo) + **TanStack Query**, UI em **shadcn/radix + Tailwind**.

## Stack

- **Vite** — dev server e build
- **TanStack Router** — rotas por arquivo (`src/pages/`), navegação e params type-safe — ver `src/pages/CLAUDE.md`
- **TanStack Query** — data fetching/cache, sempre em cima dos clientes de `src/http/`
- **react-hook-form + Zod** — formulários (padrão estrito, ver skill `form-pattern`)
- **nuqs** — estado sincronizado com query string (paginação, filtros)
- **shadcn/radix-ui + Tailwind** — componentes de UI
- **recharts** — gráficos (dashboards de usage/billing)
- **@trigger.dev/react-hooks** — status/progresso em tempo real das tasks do backend (`useRealtimeRun`/`useRealtimeStream`)
- **axios** — cliente HTTP (`src/http/api.ts`), ver `src/http/CLAUDE.md`

## Setup

```bash
cd web
pnpm install
pnpm dev
```

## Variáveis de ambiente

`.env` (não commitado):

```bash
VITE_API_BASE_URL="http://localhost:3000"
VITE_NODE_ENV="development"
```

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o dev server (Vite) |
| `pnpm build` | Type-check (`tsc -b`) + build de produção |
| `pnpm lint` | ESLint |
| `pnpm test` | Testes e2e (Playwright) |
| `pnpm test:e2e:ui` | Playwright em modo UI |
| `pnpm test:unit` | Testes unitários (Vitest) |
| `pnpm test:ui` | Vitest em modo UI |
| `pnpm storybook` | Sobe o Storybook (porta 6006) |
| `pnpm build-storybook` | Build estático do Storybook |

Mocks de API pra testes/Storybook usam **MSW** (`msw-storybook-addon`, worker em `public/`).

## Estrutura

```
src/
├── pages/           # rotas por arquivo (TanStack Router) — ver pages/CLAUDE.md
├── components/        # componentes de UI compartilhados (shadcn + próprios)
├── http/                # clientes HTTP por recurso (*.http.ts) — ver http/CLAUDE.md
├── hooks/                 # hooks compartilhados
├── context/                # contexts React
├── lib/                     # config de libs (query client, utils do shadcn, etc.)
├── schemas/                   # schemas Zod de formulário compartilhados
├── types/                       # tipos compartilhados
├── utils/                        # helpers puros (formatação, etc.)
├── stories/                       # arquivos .stories.tsx do Storybook
├── tests/                          # setup/utilitários de teste
└── storage/                         # wrappers de localStorage/sessionStorage
```

## Convenções

Documentadas como *skills* em `.claude/skills/` (carregadas automaticamente pelo Claude Code ao trabalhar nesses arquivos):

- `form-pattern` — arquitetura de formulário (React Hook Form + Zod + design system)
- `nuqs` — estado em query string
- `tanstack-query` — padrões de data fetching (`useQuery`/`useMutation`, paginação)
- `web:design` — conversão de design pra componente React
- `react-grab` — loop de captura de elementos de UI no browser

Rotas (`src/pages/`) e camada HTTP (`src/http/`) têm convenções mais detalhadas em seus próprios `CLAUDE.md`.
