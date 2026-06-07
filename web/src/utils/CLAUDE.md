# Utils

Esta pasta contém funções utilitárias puras reutilizáveis em toda a aplicação.

## O que pertence aqui

Funções puras de transformação e manipulação de dados que:
- Não possuem efeitos colaterais
- Não dependem de estado externo, contexto React ou chamadas de API
- São reutilizáveis em múltiplos contextos da aplicação

**Exemplos de categorias aceitas:** formatação de strings, parsing, transformações de dados, cálculos, validações pontuais.

**Não pertence aqui:** hooks React, chamadas de API, lógica de negócio específica de uma feature, configurações de bibliotecas.

## Padrões obrigatórios

### Nomenclatura

- **Arquivo:** kebab-case descrevendo a ação — `create-slug.ts`, `get-initials.ts`, `format-currency.ts`
- **Função:** camelCase, mesmo nome do arquivo sem hífens — `createSlug`, `getInitials`, `formatCurrency`

### Estrutura do arquivo

```ts
// Uma função por arquivo
// Tipagem explícita em parâmetros e retorno
export function nomeDaFuncao(param: Tipo): TipoRetorno {
  // implementação
}
```

- Use **named export** — nunca `export default`
- Declare tipos explícitos em todos os parâmetros e no retorno
- Prefira encadeamento de métodos para pipelines de transformação
- Use optional chaining (`?.`) e nullish coalescing (`??`) para tratar edge cases
