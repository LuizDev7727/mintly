# docs/ — Documentação pública da API

Ver [`README.md`](./README.md) para o conteúdo atual, a estrutura de pastas e o passo a passo de "adicionando um endpoint". Regras que não podem ser esquecidas:

- **Conteúdo é JSX escrito à mão em `src/app/**/page.tsx`. Não introduza MDX** nem um sistema de conteúdo por arquivo; siga o padrão da página existente mais parecida (`api-reference/get-projects/page.tsx` para endpoints, `webhooks/events/page.tsx` para eventos).
- **A sidebar é hardcoded** em `getSections()` (`src/components/sidebar.tsx`). Página nova sem entrada lá fica órfã na navegação.
- **Um bloco de resposta por status code** (200/400/401/404/500 …) usando `RequestExample`/`ResponseExample`/`CodeBlock`; não escreva blocos de código na mão com cores próprias.
- **A documentação tem que bater com a API real.** A fonte da verdade é o schema Zod da rota em `api/src/infra/http/routes/external/*.route.ts` (query params, campos e valores possíveis da resposta, status codes) — confira lá antes de escrever ou alterar um exemplo, e não invente campos. Para eventos de webhook, a fonte é `api/src/webhooks/webhook-event.ts` e `api/src/webhooks/events/`.
- Porta `3001` (`pnpm dev`); `pnpm lint` é `biome check` e `pnpm format` roda `biome format --write` — rode o lint antes de concluir.
- O texto é em inglês (é a doc pública da API); mantenha o mesmo tom e formato das páginas existentes.
