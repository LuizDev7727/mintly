# Mintly — MCP Server

Servidor [MCP](https://modelcontextprotocol.io) (Model Context Protocol) próprio do Mintly. Expõe recursos da API do Mintly como *tools* que agentes de IA (Claude, outros clientes MCP) podem chamar diretamente — hoje, listar projetos de um canal.

Roda via **stdio** (`@modelcontextprotocol/server`), não é um servidor HTTP — o cliente MCP inicia o processo e conversa com ele por stdin/stdout.

## Tools disponíveis

| Tool | Descrição | Input |
|---|---|---|
| `get-projects-tool` | Lista os projetos de um canal | `channelId: uuidv7` |

Cada tool fica em `src/tools/` e importa o schema de output correspondente de `src/contracts/`.

## Pré-requisitos

- Node.js
- pnpm
- A API do Mintly (`api/`) rodando e acessível — este servidor é só uma camada fina em cima dela, não tem lógica de negócio própria.

## Configuração

Variáveis de ambiente (arquivo `.env`, não commitado):

```bash
MINTLY_API_KEY="<sua chave de API>"
MINTLY_API_URL="http://localhost:3000"
```

Validadas em `src/env.ts` via Zod — o processo falha ao subir se alguma estiver ausente ou inválida.

## Rodando em desenvolvimento

```bash
pnpm dev
```

Sobe o [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) apontando pro servidor (`tsx --env-file .env src/index.ts`) — abre uma UI local pra testar as tools manualmente, sem precisar de um cliente MCP de verdade.

## Build

```bash
pnpm build
```

Compila `src/` pra `build/` via `tsc` e marca `build/index.js` como executável.

## Registrando este servidor num cliente MCP

Exemplo (`.mcp.json`, já presente na raiz desta pasta):

```json
{
  "mcpServers": {
    "mintly": {
      "command": "node",
      "args": ["./mcp/build/index.js"],
      "env": {
        "MINTLY_API_KEY": "...",
        "MINTLY_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Requer `pnpm build` executado antes (o cliente roda o JS compilado, não `src/` diretamente).

## Estrutura

```
mcp/
├── src/
│   ├── index.ts           # entrypoint — registra as tools e sobe o transporte stdio
│   ├── env.ts              # validação de env vars (Zod)
│   ├── lib/mcp.ts          # instância do McpServer
│   ├── tools/               # uma tool por arquivo (*.tool.ts)
│   ├── contracts/           # schemas Zod de output de cada tool
│   ├── types/                # tipos das entidades retornadas pela API
│   └── utils/my-fetch.ts    # wrapper de fetch autenticado (Bearer MINTLY_API_KEY) contra a API
├── build/                    # output do tsc, não commitado
└── .mcp.json                 # exemplo de registro do servidor num cliente MCP
```

## Adicionando uma tool nova

Siga o padrão de `src/tools/get-projects.tool.ts`:

1. Defina o schema de output em `src/contracts/<nome>-contract.ts`.
2. Crie `src/tools/<nome>.tool.ts`, chamando `mcp.registerTool(...)` com `title`, `description`, `inputSchema` (Zod) e `outputSchema` (o contract).
3. Dentro do handler, use `myFetch` pra chamar a API do Mintly — nunca acesse o banco ou outra infra diretamente daqui, este servidor é só um cliente HTTP da API.
4. Importe o arquivo da tool em `src/index.ts` (o registro acontece como efeito colateral do import).
