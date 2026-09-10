# Mintly — Docs

Site de documentação pública da API e dos webhooks do Mintly (Next.js, App Router). Layout estilo Stripe/API-reference: sidebar de navegação, blocos de código, exemplos de request/response por status code. Roda na porta **3001** (as outras apps Next.js do monorepo, `www/`, usam a 3000 padrão).

> Diferente do `www/`, aqui o conteúdo é **JSX escrito à mão por página** (`src/app/**/page.tsx`), não MDX — cada endpoint/seção é um componente React próprio, sem um sistema de conteúdo por arquivo `.mdx`. Ao adicionar uma página nova, siga o padrão das existentes em vez de introduzir MDX.

## Conteúdo atual

- **Home** (`/`) — introdução, com cards linkando pra API Reference e Webhooks.
- **API Reference** (`/api-reference`):
  - `/api-reference/get-projects` — único endpoint documentado até agora (query params, exemplo de request em `curl`, exemplos de response por status: 200/400/401/404/500).
- **Webhooks** (`/webhooks`):
  - `/webhooks` — getting started (introdução, payload de exemplo, verificação de assinatura via header `Mintly-Signature`, política de retry).
  - `/webhooks/events` — lista de eventos disponíveis.

A navegação da sidebar (`src/components/sidebar.tsx`) é hardcoded por seção, baseada no prefixo da URL atual (`/api-reference/*` vs `/webhooks/*`) — não é gerada a partir dos arquivos de rota.

## Rodando localmente

```bash
cd docs
pnpm dev
```

Abre em [http://localhost:3001](http://localhost:3001).

```bash
pnpm build   # build de produção
pnpm lint    # biome check
pnpm format  # biome format --write
```

## Estrutura

```
docs/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # home
│   │   ├── layout.tsx                         # layout raiz (Header + Sidebar + SidebarProvider)
│   │   ├── api-reference/
│   │   │   ├── page.tsx                        # introdução da API Reference
│   │   │   └── get-projects/page.tsx            # doc de 1 endpoint
│   │   └── webhooks/
│   │       ├── page.tsx                         # getting started
│   │       └── events/page.tsx                   # lista de eventos
│   ├── components/
│   │   ├── header.tsx, sidebar.tsx, sidebar-context.tsx   # shell/navegação
│   │   ├── code-block.tsx                       # bloco de código com syntax highlight manual
│   │   ├── request-example.tsx, response-example.tsx  # painel de exemplo (usado no API Reference)
│   │   ├── event-card.tsx                        # card de evento (usado em /webhooks/events)
│   │   ├── tabs.tsx                              # componente de abas genérico
│   │   └── on-this-page.tsx                       # TOC lateral com scroll-spy
│   └── hooks/use-active-heading.ts                # hook por trás do scroll-spy do OnThisPage
```

## Adicionando um endpoint novo na API Reference

1. Crie `src/app/api-reference/<endpoint>/page.tsx`, seguindo o formato de `get-projects/page.tsx` (metadata, lista de query params, `RequestExample` com `curl`, `ResponseExample` com um bloco por status code).
2. Adicione o item correspondente em `getSections()` dentro de `src/components/sidebar.tsx`, na seção `"Endpoints"`.
3. O syntax highlight dos blocos JSON/curl é feito manualmente via `<span>` coloridas (`text-sky-300` pra chaves, `text-orange-300` pra valores string) — não há um highlighter automático (ex: Shiki) plugado ainda. Repetitivo, mas é o padrão atual; não introduzir uma lib de highlight nova sem alinhar antes.
