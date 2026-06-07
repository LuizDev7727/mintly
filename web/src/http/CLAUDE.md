# HTTP Layer — Padrões e Convenções

## Estrutura de pastas

```
src/http/
├── api.ts                  # Cliente axios configurado
├── organizations/          # CRUD de orgs, membros e métricas
├── invites/                # Criação, listagem e resposta de convites
├── posts/                  # Criação e listagem de posts
├── integrations/           # OAuth e deleção de integrações
└── mocks/                  # Handlers MSW para testes
```

## Cliente HTTP (`api.ts`)

```typescript
import { api } from "../api";
```

- Instância axios criada com `axios.create()`
- `baseURL` vinda de `env.VITE_API_URL`
- `withCredentials: true` — autenticação via cookies de sessão
- Sempre importado com caminho relativo `"../api"` ou `"./api"`

---

## Convenção de nomenclatura de arquivos

```
[ação]-[recurso].http.ts
```

Exemplos: `create-organization.http.ts`, `get-members.http.ts`, `revoke-invite.http.ts`

- Sempre `kebab-case`
- Sempre sufixo `.http.ts`
- O nome do arquivo descreve a ação e o recurso, sem redundância

---

## Assinatura padrão de função

```typescript
export async function [ação][Recurso]Http(
  params: [Ação][Recurso]Params,
): Promise<[Ação][Recurso]Response>
```

- Nome com sufixo `Http` (ex: `createOrganizationHttp`, `getMembersHttp`)
- Recebe um único objeto `params` com tipagem local
- Retorno explicitamente tipado com `Promise<T>`
- Sempre `async/await`, nunca `.then()`

---

## Tipagem

### Tipos de parâmetros
Definidos localmente no arquivo, **nunca exportados**:

```typescript
type CreateOrganizationParams = { name: string; slug: string };
```

### Tipos de resposta
Exportados quando o consumidor precisa referenciar o tipo:

```typescript
export type GetOrganizationsResponse = { organizations: Organization[] };
```

### Tipos auxiliares exportados
Exportar quando representam entidades usadas fora do arquivo:

```typescript
export type OrgInvite = { id: string; email: string; role: "ADMIN" | "MEMBER" | null };
```

### Generic na chamada axios
Sempre passar o tipo de resposta como generic diretamente no método:

```typescript
const { data } = await api.get<GetOrganizationsResponse>("/organizations");
```

---

## Padrões de chamada HTTP

### GET simples
```typescript
const { data } = await api.get<ResponseType>("/path");
return data;
```

### GET com parâmetros de URL
```typescript
const { orgSlug } = params;
const { data } = await api.get<ResponseType>(`/organizations/${orgSlug}/members`);
```

### GET com query params (paginação e filtros)
```typescript
const { orgSlug, page, limit } = params;
const { data } = await api.get<ResponseType>(`/organizations/${orgSlug}/members`, {
  params: { page, limit },
});
```

### POST com body
```typescript
const { orgSlug, email, role } = params;
const { data } = await api.post<ResponseType>(`/organizations/${orgSlug}/invites`, { email, role });
```

### PUT
```typescript
const { slug, name, description } = params;
await api.put(`/organizations/${slug}`, { name, description });
```

### DELETE
```typescript
const { inviteId } = params;
await api.delete(`/organizations/${orgSlug}/invites/${inviteId}`);
```

---

## Regras de URL

| Tipo de dado          | Onde vai          |
|-----------------------|-------------------|
| ID / slug de recurso  | Path (`/orgs/:id`) |
| Paginação (`page`, `limit`, `pageIndex`) | Query params |
| Filtros (`titleFilter`, `playlistId`)    | Query params |
| Corpo de criação/atualização            | Request body |

---

## Tratamento de resposta

**Retornar `data` diretamente quando o caller precisa:**
```typescript
const { data } = await api.get<GetOrganizationResponse>(...);
return data;
```

**Retornar void quando não há corpo relevante:**
```typescript
await api.delete(`/organizations/${orgSlug}/invites/${inviteId}`);
// sem return
```

**Extrair campo específico quando o caller só precisa de um ID:**
```typescript
const { data } = await api.post<{ organizationId: string }>(...);
return { organizationId: data.organizationId };
```

---

## Tratamento de erros

Nenhum `try/catch` na camada HTTP. Erros são propagados como rejeição de Promise e tratados pelo TanStack Query (`onError`, `throwOnError`) ou pelo consumidor direto.

---

## Union types recorrentes

```typescript
role: "ADMIN" | "MEMBER" | null
provider: "YOUTUBE" | "TIKTOK"
```

Definir inline no tipo local quando usado em apenas um arquivo, exportar como tipo nomeado quando reutilizado.
