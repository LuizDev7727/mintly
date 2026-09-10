# mcp/ — Servidor MCP (Convenções)

Servidor MCP (`@modelcontextprotocol/server`, transporte stdio) que expõe endpoints da API do Mintly como *tools* pra agentes de IA. **Não tem lógica de negócio própria** — cada tool é um wrapper fino em cima de um endpoint HTTP existente em `api/`. Se uma tool precisar de uma regra de negócio nova, ela deve viver na API, não aqui.

Ver [`README.md`](./README.md) para visão geral, setup e como rodar.

## Estrutura

```
src/
├── index.ts           # entrypoint — importa as tools (efeito colateral: registro) e sobe o transporte stdio
├── env.ts              # validação de env vars (Zod) — MINTLY_API_KEY, MINTLY_API_URL
├── lib/mcp.ts           # instância única do McpServer, importada por toda tool
├── tools/                # uma tool por arquivo, sufixo .tool.ts
├── contracts/             # schema Zod do output de cada tool, sufixo -contract.ts
├── types/                  # tipos das entidades cruas retornadas pela API (espelham a API, não o contract)
└── utils/my-fetch.ts       # wrapper de fetch autenticado contra a API do Mintly
```

## Anatomia de uma tool

Toda tool segue exatamente o formato de `src/tools/get-projects.tool.ts`:

```typescript
import { myFetch } from "../utils/my-fetch.js";
import { Project } from "../types/project.js";
import { z } from "zod";
import { mcp } from "../lib/mcp.js";
import { getProjectsContract } from "../contracts/get-projects-contract.js";

export type GetProjectsResponse = {
  projects: Array<Project>;
};

function formatProject(project: Project): string {
  return [`Id: ${project.id}`, `Name: ${project.name}`, "----------------------------"].join("\n");
}

export const getProjectsTool = mcp.registerTool(
  "get-projects-tool",
  {
    title: "Get Projects",
    description: "Get projects for a channel",
    inputSchema: z.object({ channelId: z.uuidv7() }),
    outputSchema: getProjectsContract,
  },
  async ({ channelId }) => {
    const { data, error } = await myFetch<GetProjectsResponse>({ path: "/projects", channelId });

    if (error) {
      return {
        content: [{ type: "text", text: `Failed to fetch projects: ${error.message}` }],
        structuredContent: [],
        isError: true,
      };
    }

    const { projects } = data;
    const text = projects.length === 0
      ? "No projects created for this channel"
      : `\n\n${projects.map(formatProject).join("\n")}`;

    return { content: [{ type: "text", text }], structuredContent: projects };
  },
);
```

**Regras:**

- Nome da tool (primeiro argumento de `registerTool`): `kebab-case`, sufixo `-tool` (ex: `get-projects-tool`).
- `inputSchema`/`outputSchema` são sempre Zod — nunca tipagem manual solta.
- `outputSchema` importa de `src/contracts/<nome>-contract.ts`; o contract exporta o schema **e** o tipo inferido (`z.infer<typeof schema>`).
- O handler sempre retorna dois formatos ao mesmo tempo: `content` (texto legível por humano/LLM, formatado por uma função `format<Entidade>` local) e `structuredContent` (o dado cru, tipado pelo `outputSchema`). Nunca só um dos dois.
- Erro de rede/API vira `{ content: [...texto de erro...], structuredContent: [], isError: true }` — nunca lança exceção pra fora do handler.
- Toda chamada à API do Mintly passa por `myFetch`, nunca por `fetch`/`ky` direto na tool.
- Depois de criar a tool, importe o arquivo em `src/index.ts` (`import "./tools/<nome>.tool.js"`) — o registro no `McpServer` acontece como efeito colateral do import; sem isso a tool existe no código mas nunca é exposta.

## `myFetch` — cliente HTTP autenticado

Único ponto de acesso à API do Mintly. Sempre:

- Monta a URL como `/api/v1${path}` relativo a `env.MINTLY_API_URL`.
- Adiciona `channelId` como query param automaticamente (parâmetro obrigatório de `MyFetchProps`, mesmo que vazio).
- Injeta `Authorization: Bearer ${env.MINTLY_API_KEY}`.
- Retorna `{ data, error }` (nunca lança) — sempre desestruture e trate `error` explicitamente, nunca assuma que `data` existe sem checar.

Se uma tool nova precisar de um parâmetro de rota diferente de `channelId` (ex: `postId`, `orgSlug`), estenda `MyFetchProps` em vez de contornar `myFetch` com uma chamada HTTP separada.

## Imports

Todo import interno usa extensão `.js` explícita (ex: `from "../lib/mcp.js"`), mesmo os arquivos sendo `.ts` — é `type: module` + `tsc` compilando pra ESM puro, sem bundler. Não omitir a extensão.
