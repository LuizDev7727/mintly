# src/utils

Funções utilitárias puras e helpers sem estado. Cada arquivo exporta uma função específica — importe diretamente do caminho do arquivo.

## Arquivos

### `create-slug.ts`
Exporta `createSlug(text: string): string`.

Converte qualquer texto em slug URL-safe:
1. Normaliza Unicode (NFD) e remove acentos.
2. Converte para minúsculas e faz trim.
3. Remove caracteres inválidos (mantém apenas `a-z`, `0-9`, espaços e `-`).
4. Substitui espaços por `-` e colapsa múltiplos hífens consecutivos.

```ts
createSlug("Meu Post Incrível!") // → "meu-post-incrivel"
```

### `cloudflare/generate-signed-url.ts`
Exporta `generateSignedUrl({ key }: GenerateSignedUrlParams): Promise<string>`.

Gera uma URL pré-assinada (presigned) para leitura de um objeto no Cloudflare R2, válida por **1 hora**. Usa `r2Client` e `BUCKET_NAME` de `@/lib/r2`.

- `key` — caminho do objeto no bucket (ex: `"uploads/foto.jpg"`).

```ts
const url = await generateSignedUrl({ key: "uploads/foto.jpg" });
```

## Regras

- Não coloque lógica de negócio aqui — apenas funções auxiliares reutilizáveis.
- `cloudflare/` agrupa helpers específicos de integração com Cloudflare R2; crie subdiretórios similares para outros providers se necessário.
- O parâmetro `expiresIn` existe no tipo `GenerateSignedUrlParams` mas não é usado na implementação — a expiração é fixa em 3600 s (1 hora).
