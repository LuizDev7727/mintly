# src/lib — Padrões de Código

Esta pasta contém configurações e wrappers de bibliotecas de terceiros. Cada arquivo expõe uma instância singleton já configurada para uso no restante da aplicação.

## Propósito da pasta

- Centralizar a configuração de dependências externas em um único lugar
- Evitar que componentes e hooks importem bibliotecas diretamente sem passar pela configuração central
- Não conter lógica de negócio — apenas setup e re-export de ferramentas

## Padrões obrigatórios

### 1. Singleton por arquivo

Cada arquivo exporta uma única instância configurada. Não crie múltiplas instâncias da mesma biblioteca em lugares diferentes.

```ts
// correto
export const queryClient = new QueryClient({ ... });

// errado — instanciar dentro de componentes ou hooks
const client = new QueryClient();
```

### 2. Variáveis de ambiente via `@/env`

Sempre importe env de `@/env`, nunca acesse `import.meta.env` diretamente.

```ts
// correto
import { env } from "@/env";
export const r2Client = new S3Client({ endpoint: env.VITE_R2_ENDPOINT });

// errado
new S3Client({ endpoint: import.meta.env.VITE_R2_ENDPOINT });
```

### 3. Re-export com configuração centralizada

Quando uma biblioteca requer extensões ou plugins (ex: dayjs), configure tudo aqui e re-exporte. O restante da aplicação importa de `@/lib/*`, não da biblioteca diretamente.

```ts
// correto — em qualquer componente ou hook
import { dayjs } from "@/lib/dayjs";

// errado — importar dayjs sem plugins configurados
import dayjs from "dayjs";
```

### 4. Somente exports nomeados

Não use `export default`. Todos os exports são nomeados para facilitar rastreamento e refatoração.

```ts
// correto
export const authClient = createAuthClient({ ... });

// errado
export default createAuthClient({ ... });
```

### 5. Constantes relacionadas no mesmo arquivo

Constantes fortemente acopladas à instância exportada ficam no mesmo arquivo.

```ts
// r2.ts — constante e cliente no mesmo arquivo
export const BUCKET_NAME = "posthub";
export const r2Client = new S3Client({ ... });
```

### 6. Arquivos `.ts`, não `.tsx`

Nenhum arquivo desta pasta deve conter JSX. Se precisar de React, o código não pertence aqui.

## O que NÃO colocar aqui

- Hooks (`use*`) — vão em `src/hooks/`
- Funções utilitárias de domínio — vão em `src/utils/`
- Componentes React — vão em `src/components/`
- Chamadas de API — vão em `src/http/`

## Arquivos existentes

| Arquivo | Exporta | Finalidade |
|---|---|---|
| `auth.ts` | `auth` | Cliente better-auth com plugin de organizações |
