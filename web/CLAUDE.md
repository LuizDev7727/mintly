# web/ — Convenções

Ver [`README.md`](./README.md) para stack, setup e scripts. Este arquivo cobre convenções transversais e o mapa de onde cada tipo de código deve morar — várias subpastas já têm `CLAUDE.md` próprio, mais detalhado; leia o mais específico antes de editar.

## Mapa de `CLAUDE.md` por pasta

| Pasta | Cobre |
|---|---|
| `src/pages/CLAUDE.md` | Rotas TanStack Router, loaders, layouts, search params |
| `src/http/CLAUDE.md` | Clientes HTTP (`*.http.ts`), convenção de params/response |
| `src/lib/CLAUDE.md` | Singletons de biblioteca externa (auth, query client, dayjs) |
| `src/schemas/CLAUDE.md` | Schemas Zod de formulário, por domínio |
| `src/types/CLAUDE.md` | Tipos de entidade de domínio compartilhados |
| `src/utils/CLAUDE.md` | Funções puras reutilizáveis |

`src/components/`, `src/hooks/`, `src/context/`, `src/storage/` ainda não têm `CLAUDE.md` próprio — convenções observadas abaixo.

## Onde um componente novo deve morar

Duas categorias, não misturar:

- **Componente compartilhado entre rotas** → `src/components/` (`src/components/ui/` são os primitivos do shadcn — não editar à mão, regenerar via CLI do shadcn; fora do `ui/`, componentes de domínio reutilizados em mais de uma página, ex: `src/components/profile/`).
- **Componente usado só numa rota** → colocalizado dentro da própria rota, em `src/pages/<rota>/-components/<nome>.tsx` (o prefixo `-` exclui a pasta do roteamento do TanStack Router). É o padrão dominante no projeto — antes de subir um componente pra `src/components/`, confirmar que ele é realmente reaproveitado em mais de uma rota.

## `src/hooks/`

Hooks React compartilhados entre rotas (ex: `use-mobile.ts`, `use-payment-method-status.ts`). Mesma regra de "compartilhado vs local": um hook usado só numa rota fica colocalizado com ela (`-components/` ou direto na pasta da rota), não aqui.

## `src/context/`

Contexts React globais (ex: `view-mode-context.tsx`). Poucos — a maior parte do estado compartilhado já passa por TanStack Query (server state) ou nuqs (state em URL), não por Context. Antes de criar um Context novo, considerar se o estado não deveria estar num desses dois lugares.

## `src/storage/`

Wrappers de `localStorage`/`sessionStorage` (ex: `resumable-upload-storage.ts`, usado pra persistir progresso de upload entre reloads). Acesso direto a `localStorage`/`sessionStorage` fora daqui deve ser evitado — encapsular num wrapper tipado.

## TanStack Query — comportamento global (`src/lib/react-query.ts`)

Configuração central já trata dois casos, não reimplementar por hook:

- **Falha de rede persistente**: depois de 3 tentativas de retry numa query, mostra um toast de erro genérico ("aplicação demorando mais que o esperado") e para de tentar — não escrever lógica de retry customizada em `useQuery` individual pra isso.
- **Erro de mutation**: qualquer `useMutation` sem `onError` próprio já mostra um toast com a mensagem de erro da API (`error.response.data.message`, via `isAxiosError`) automaticamente. Só passe `onError` customizado quando precisar de comportamento *além* do toast (ex: reverter um estado local) — no caso normal, deixar o handler global cuidar disso.

## Autenticação (`src/lib/auth.ts`)

Cliente `better-auth` com o plugin `organizationClient()` (multi-tenant: usuário pode pertencer a várias orgs) e `inferAdditionalFields` pros campos custom do `user` (ex: `bio`). Ao adicionar um campo custom novo no schema de usuário do backend, espelhar aqui em `inferAdditionalFields` pra manter a tipagem do client em sincronia.

## Variáveis de ambiente

Sempre via `@/env` (nunca `import.meta.env` direto) — ver `src/lib/CLAUDE.md`, regra 2.
