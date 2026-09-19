<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# www/ — Site institucional

Ver [`README.md`](./README.md) para stack e estrutura. Regras do projeto (fora do bloco acima, que o `next dev` reescreve):

- **Idiomas: os segmentos de URL são `en` e `pt`** (não `en-US`/`pt-BR`; só os arquivos de dicionário mantêm esses nomes). Toda rota de conteúdo fica sob `src/app/[lang]/`, e o texto vem de `getDictionary()` (`src/app/[lang]/dictionaries.ts`).
- **Texto novo = as duas línguas.** Adicione a chave em `src/dictionaries/en-us.json` **e** `pt-br.json` (hoje têm as mesmas chaves; mantenha assim). Conteúdo escrito direto no JSX/MDX também precisa existir nas duas versões.
- **Links internos levam o prefixo do idioma:** `href={`/${locale}/blog/${slug}`}`. Um `href="/blog"` cai no redirecionamento do `src/proxy.ts` em vez de manter o idioma escolhido.
- **Blog e changelog são MDX** nos route groups `(posts)`/`(entries)`, com frontmatter lido por `gray-matter`; siga o formato de uma entrada existente em vez de inventar campos. (Isto é o contrário de `docs/`, que é JSX à mão.)
- UI com Radix + Tailwind + `class-variance-authority`; componentes base em `src/components/ui/`.
- Lint e formatação com Biome: `pnpm lint` / `pnpm format`. Rode o lint antes de concluir.
