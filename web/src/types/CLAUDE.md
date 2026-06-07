# Types

Esta pasta contém tipos TypeScript compartilhados que representam as entidades de domínio da aplicação.

## Padrão de arquivo

- Um arquivo por entidade de domínio, nomeado em `kebab-case` (ex: `organization.ts`, `pending-invite.ts`)
- Cada arquivo exporta apenas `type` (nunca `interface` ou `class`)
- Sem dependências externas — apenas tipos primitivos do TypeScript e outros tipos desta pasta

## Convenções

- **Nomes em PascalCase**: `Post`, `Member`, `Organization`
- **Unions de string para status/roles/actions**: use union literal em vez de enum (ex: `"OWNER" | "ADMIN" | "MEMBER"`)
- **Campos opcionais nulos**: prefira `field: string | null` em vez de `field?: string`
- **Datas**: use `Date` para timestamps manipulados no cliente; use `string` para datas que chegam como ISO string e são exibidas sem manipulação
- **Objetos aninhados inline**: tipos simples de subobjetos (ex: `author`, `socialsToPost`) são declarados inline no tipo pai — só extraia para tipo próprio se for reutilizado em mais de um arquivo
- **Re-exports**: não re-exporte tipos de bibliotecas externas aqui

## O que pertence a esta pasta

Tipos que representam entidades retornadas pela API e usadas em múltiplos lugares da aplicação:

- Entidades de domínio (`Post`, `Organization`, `Member`, `Activity`)
- Tipos auxiliares fortemente acoplados a uma entidade (`MemberRole`, `PendingInvite`)

## O que NÃO pertence a esta pasta

- Tipos de props de componentes React → defina inline no próprio componente
- Tipos de formulário/validação → defina junto ao schema Zod do formulário
- Tipos de resposta de API → use os tipos de domínio desta pasta diretamente ou crie wrappers no serviço HTTP
- Tipos genéricos utilitários (paginação, resposta, erro) → crie em `src/lib/` se necessário
