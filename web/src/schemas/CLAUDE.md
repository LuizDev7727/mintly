# Schemas — Padrões e Convenções

## Estrutura de Diretórios

```
src/schemas/
├── auth/
│   ├── sign-in.schema.ts
│   └── sign-up.schema.ts
├── domain-a/
│   └── create-item.schema.ts
└── domain-b/
    ├── create-resource.schema.ts
    └── update-resource.schema.ts
```

Schemas são organizados por domínio em subpastas. Cada arquivo contém um único schema e seu tipo inferido.

---

## Convenções de Nomenclatura

| O quê | Convenção | Exemplo |
|---|---|---|
| Arquivo | `kebab-case.schema.ts` | `create-resource.schema.ts` |
| Schema export | `{ação}{Recurso}Schema` | `createResourceSchema` |
| Tipo export | `{Ação}{Recurso}FormType` | `CreateResourceFormType` |

O sufixo `FormType` indica que o tipo é derivado de um schema de formulário, não de uma entidade do banco.

---

## Anatomia de um Schema

Todo arquivo segue o mesmo padrão: definição do schema + tipo inferido exportados juntos.

```typescript
import { z } from 'zod'

export const createItemSchema = z.object({
  name: z.string(),
})

export type CreateItemFormType = z.infer<typeof createItemSchema>
```

Nunca declare o tipo manualmente — use sempre `z.infer<typeof schema>`.

---

## Validações por Tipo de Campo

### String simples
```typescript
name: z.string()
```

### Email
```typescript
email: z.email()
email: z.email('Invalid email address') // com mensagem customizada
```

### Password com regras compostas
Use `.min()` para tamanho e `.refine()` para cada regra adicional. Cada `refine` tem sua própria mensagem de erro:

```typescript
password: z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (value) => /[A-Z]/.test(value),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (value) => /[0-9]/.test(value),
    'Password must contain at least one number'
  )
  .refine(
    (value) => /[^A-Za-z0-9]/.test(value),
    'Password must contain at least one special character'
  )
```

### Confirmação de campo (cross-field validation)
Use `.refine()` no nível do objeto para comparar campos. Aponte o `path` para o campo que deve exibir o erro:

```typescript
z.object({
  password: z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  }
)
```

### Arquivo
```typescript
avatar: z.file().optional()
document: z.file()
```

### Data nullable
```typescript
scheduledAt: z.date().nullable()
```

### UUID v7
```typescript
resourceId: z.uuidv7()
```

### Enum
```typescript
status: z.enum(['ACTIVE', 'INACTIVE'])
```

### Boolean
```typescript
isEnabled: z.boolean()
```

### Array com validação de mínimo
```typescript
items: z.array(z.object({ ... })).min(1, { error: 'Select at least one item' })
```

### Array de objetos (schema aninhado)
```typescript
entries: z.array(
  z.object({
    file: z.file(),
    scheduledAt: z.date().nullable(),
    targets: z.array(
      z.object({
        id: z.uuidv7(),
        type: z.enum(['TYPE_A', 'TYPE_B']),
      })
    ).min(1, { error: 'Select at least one target' }),
    isEnabled: z.boolean(),
  })
)
```

### Campo opcional
```typescript
avatar: z.file().optional()
name: z.string().optional()
```

---

## Create vs Update

Schemas de criação têm campos obrigatórios. Schemas de atualização tornam os campos opcionais individualmente (não use `.partial()` indiscriminadamente — escolha explicitamente quais campos são editáveis):

```typescript
// Criação — campos obrigatórios
export const createResourceSchema = z.object({
  name: z.string(),
  avatar: z.file().optional(), // opcional mesmo na criação
})

// Atualização — campos opcionais explícitos
export const updateResourceSchema = z.object({
  name: z.string().optional(),
  avatar: z.file().optional(),
})
```
