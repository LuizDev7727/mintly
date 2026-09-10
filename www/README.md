# Mintly — Site institucional

Site de marketing/institucional do Mintly (Next.js, App Router). Internacionalizado (`en-US`/`pt-BR`), com blog e changelog em MDX.

## Stack

- **Next.js** (App Router) + **MDX** (`@next/mdx`) — conteúdo de blog/changelog é `.mdx` dentro da própria árvore de rotas
- **Radix UI + Tailwind + class-variance-authority** — UI
- **@formatjs/intl-localematcher + negotiator** — negociação de idioma pelo header `Accept-Language`
- **remark/rehype** (`remark-gfm`, `remark-toc`, `remark-mdx-frontmatter`, `rehype-slug`, `rehype-autolink-headings`) — pipeline de processamento do Markdown/MDX (GFM, TOC, frontmatter, âncoras de heading)

## Internacionalização

Locales suportados: `en-US` (default) e `pt-BR`, com dicionários em `src/dictionaries/{en-us,pt-br}.json`.

`src/proxy.ts` roda antes de qualquer rota: se a URL não começa com `/en-US` ou `/pt-BR`, detecta o idioma preferido do visitante (via header `Accept-Language`, matcher do `@formatjs/intl-localematcher`) e redireciona pra `/<locale>/<resto-da-url>`. Todas as rotas de conteúdo ficam sob `src/app/[lang]/`.

## Rodando localmente

```bash
cd www
pnpm dev
```

Abre em [http://localhost:3000](http://localhost:3000) (porta padrão — diferente de `docs/`, que usa 3001, pra rodar os dois ao mesmo tempo).

```bash
pnpm build   # build de produção
pnpm lint    # biome check
pnpm format  # biome format --write
```

## Estrutura

```
src/
├── proxy.ts                       # detecção/redirect de locale
├── dictionaries/                    # en-us.json, pt-br.json
├── mdx-components.tsx                 # componentes usados dentro de todo .mdx
├── lib/                                 # helpers (parsing de frontmatter via gray-matter, etc.)
├── components/                            # componentes de UI compartilhados
└── app/[lang]/
    ├── layout.tsx                          # layout raiz por locale
    ├── page.tsx                             # home
    ├── (home)/components/                     # componentes específicos da home (ex: features.tsx)
    ├── blog/
    │   ├── page.tsx                            # listagem
    │   ├── (posts)/layout.tsx                   # layout compartilhado dos posts
    │   └── (posts)/<slug>/page.mdx               # um post = uma pasta com page.mdx
    └── changelog/
        ├── page.tsx                            # listagem
        ├── (entries)/layout.tsx                 # layout compartilhado das entries
        └── (entries)/<slug>/page.mdx             # uma entry = uma pasta com page.mdx
```

## Adicionando um post de blog ou entry de changelog

Criar `src/app/[lang]/blog/(posts)/<slug>/page.mdx` (ou o equivalente em `changelog/(entries)/`) — o slug da pasta vira a URL. `(posts)`/`(entries)` são route groups (não entram na URL), só existem pra dar um `layout.tsx` compartilhado aos posts/entries sem afetar a página de listagem (`blog/page.tsx`).
