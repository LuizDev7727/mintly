# Rotas (`src/pages/`)

TanStack Router com rotas por arquivo. A API do router o agente já conhece — aqui só o que é convenção **deste** projeto. O mapa de URLs vem do próprio caminho (`orgs/$slug/channels/$channel/…`); a árvore é gerada pelo plugin em `src/route-tree.gen.ts` e não se edita à mão.

## Toda rota define `head()`

`title` no formato `"<Nome da página> | Mintly"` e `description`. Rota sem `head()` fica sem título de aba.

```tsx
export const Route = createFileRoute("/orgs/$slug/members/")({
  head: () => ({
    meta: [
      { title: "Members | Mintly" },
      { name: "description", content: "Organization members." },
    ],
  }),
  component: MembersPage,
});
```

## Estrutura de uma rota

- Rota nova = uma pasta com `index.tsx`; `layout.tsx` para o layout da subárvore. Não crie rota como arquivo `.tsx` solto (`privacy-policy.tsx` e `terms-of-service.tsx` são exceções antigas, não copie).
- Componentes usados só naquela rota ficam em `<rota>/-components/` (o `-` tira a pasta do roteamento). Só suba para `src/components/` o que for reaproveitado em mais de uma rota — ver `web/CLAUDE.md`.

## Dados: `useQuery` + `*.http.ts`, não `loader`

Os dados vêm de `useQuery` chamando uma função de `@/http/**/*.http.ts` (ver `src/http/CLAUDE.md` e a skill `tanstack-query`). `loader` existe em **um** único lugar do projeto — não é o padrão. Não faça `useEffect` + fetch.

## Params e search params

- Leia params no componente que precisa, com `useParams({ from: "/orgs/$slug" })`; não passe `slug`/`channel` por prop por várias camadas.
- Estado de filtro/paginação na URL usa **nuqs** (`useQueryState`), como nas telas de listagem — ver a skill `nuqs`. `validateSearch` só aparece em `settings`; para um filtro novo, siga o nuqs.

## Guards

O redirecionamento para `/auth` fica em `beforeLoad` nos layouts (`orgs/$slug/layout.tsx`, `auth/layout.tsx`). É só conveniência de navegação no client: a autorização de verdade é feita pela API (`checkUserSession`/`checkMembership`), então nunca trate o guard como proteção de dados.

## Navegação

Links internos com `<Link to="…" params={{…}}>` (tipado), nunca `<a href>`. `<a href>` só para `mailto:` e links externos.
