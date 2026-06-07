# Singleton Clients

Singleton clients e instâncias de serviços externos. Cada arquivo exporta um cliente já configurado — importe diretamente, nunca reinstancie.

## Arquivos

### `auth.ts`
InstÃ¢ncia do **better-auth** com:
- Adapter Drizzle apontando para o schema completo (users, sessions, accounts, organizations, members, invitations, verifications).
- `generateId: false` â€” IDs sÃ£o gerados pela aplicaÃ§Ã£o, nÃ£o pelo better-auth.
- Cookie `state` com `sameSite: none` + `secure: true` em produÃ§Ã£o; `lax` em dev (necessÃ¡rio para OAuth cross-origin com o front em Vercel).
- Social provider Google (credenciais via env).
- Plugins: `organization()` e `testUtils()`.

### `google.ts`
Cliente **Google GenAI** (Gemini). Exporta `googleAi` â€” use para chamadas Ã  API Gemini.

Env: `GEMINI_API_KEY`.

### `r2.ts`
Cliente S3-compatÃ­vel para **Cloudflare R2**. Exporta `r2Client` (S3Client) e a constante `BUCKET_NAME = "posthub"`.

Sempre use `BUCKET_NAME` ao referenciar o bucket; nÃ£o hardcode a string.

Env: `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.

### `replicate.ts`
Cliente **Replicate** para inferÃªncia de modelos de IA. Exporta `replicate`.

Env: `REPLICATE_API_TOKEN`.

## Regras

- NÃ£o crie lÃ³gica de negÃ³cio aqui â€” apenas inicializaÃ§Ã£o de clientes.
- Todas as envs sÃ£o validadas em `@/env` antes de chegarem aqui; nÃ£o acesse `process.env` diretamente.
