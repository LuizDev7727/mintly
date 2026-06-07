# Criação de mocks de endpoints da API

Os mocks utilizam [MSW (Mock Service Worker)](https://mswjs.io/) e ficam em `src/http/mocks`.

### Passos para criar um novo mock

#### 1. Crie o arquivo do mock

Nome do arquivo: `src/http/mocks/<nome-do-endpoint>-mock.ts` (kebab-case, sufixo `-mock`).

#### 2. Estrutura do arquivo

```ts
import { http, HttpResponse } from 'msw'

import { MinhaEndpointParams, MinhaEndpointRequest, MinhaEndpointResponse } from '../minha-endpoint'

export const minhaEndpointMock = http.get<
  MinhaEndpointParams,  // params de URL (ex: { orderId: string })
  MinhaEndpointRequest, // body da requisição
  MinhaEndpointResponse // tipo da resposta JSON
>('/rota/da/api', async ({ request, params }) => {
  return HttpResponse.json({ /* dados mockados */ })
})
```

#### 3. Ordem dos generics em `http.<method><Params, RequestBody, ResponseBody>`

| Posição | Tipo | Quando usar `never` |
|---------|------|---------------------|
| 1º | `Params` — parâmetros de URL (`:id`) | Sem parâmetros de URL |
| 2º | `RequestBody` — corpo da requisição | GET, DELETE ou sem body |
| 3º | `ResponseBody` — tipo da resposta JSON | Sem corpo na resposta |

#### 4. Padrões de resposta

```ts
// JSON com dados
return HttpResponse.json({ campo: 'valor' })

// Sem body, apenas status
return new HttpResponse(null, { status: 204 })

// Erro
return new HttpResponse(null, { status: 400 })

// Com headers (ex: cookie de autenticação)
return new HttpResponse(null, {
  headers: { 'Set-Cookie': 'auth=sample-jwt-token' },
})
```

#### 5. Leitura de parâmetros no handler

```ts
// Query string (?pageIndex=0&status=pending)
async ({ request }) => {
  const { searchParams } = new URL(request.url)
  const pageIndex = searchParams.get('pageIndex') ? Number(searchParams.get('pageIndex')) : 0
  const status = searchParams.get('status')
}

// URL params (/orders/:orderId)
async ({ params }) => {
  const { orderId } = params
}

// Request body (POST/PUT)
async ({ request }) => {
  const { nome } = await request.json()
}
```

#### 6. Simule cenários de erro com IDs/valores especiais

```ts
if (orderId === 'error-order-id') {
  return new HttpResponse(null, { status: 400 })
}
return new HttpResponse(null, { status: 204 })
```

#### 7. Registre o mock em `handlers.ts`

```ts
// src/http/mocks/handlers.ts
import { minhaEndpointMock } from './minha-endpoint-mock'

export const handlers = [
  // ...handlers existentes...
  minhaEndpointMock,
]
```

> `index.ts` não precisa ser alterado — ele apenas inicializa o worker com os `handlers`.

---

### Exemplos de referência por método HTTP

| Método | Exemplo de arquivo |
|--------|--------------------|
| GET sem params | `get-profile-mock.ts`, `get-month-receipt-mock.ts` |
| GET com query string | `get-orders-mock.ts` |
| GET com URL param | `get-order-details-mock.ts` |
| POST com body | `sign-in-mock.ts`, `register-restaurant-mock.ts` |
| PUT com body | `update-profile-mock.ts` |
| PUT/PATCH com URL param | `approve-order-mock.ts` |

### Convenções de nomenclatura

- **Arquivo**: `get-orders-mock.ts`
- **Export**: `export const getOrdersMock` (camelCase, sufixo `Mock`)
- **Tipos importados**: do arquivo de API correspondente em `src/http/<nome-do-endpoint>.ts`
  - `*Params` — parâmetros de URL
  - `*Request` — corpo da requisição
  - `*Response` — resposta da API
