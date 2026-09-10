# src/hooks — Padrões e Convenções

Hooks React **compartilhados entre rotas**. Hook usado só numa página fica colocalizado com ela, não aqui (mesma regra de `src/components/`).

## Nomenclatura

- Arquivo: `use-<nome>.ts` (ou `.tsx` se retornar/usar JSX), `kebab-case`.
- Hook: `camelCase`, prefixo `use`, **deveria** casar com o nome do arquivo sem os hífens (`use-hover-capable.ts` → `useHoverCapable`, `use-payment-method-status.ts` → `usePaymentMethodStatus`). Exceção existente: `use-mobile.ts` exporta `useIsMobile` (nome não casa com o arquivo) — não copiar esse padrão em hooks novos, é inconsistência legada.

## Retorno: objeto, não valor solto

Preferir retornar um objeto, mesmo com um único campo — deixa espaço pra adicionar mais estado depois sem quebrar todo call site (ex: `usePaymentMethodStatus` retorna `{ hasPaymentMethod, isLoading }`, `useHoverCapable` retorna `{ canHover }`). `useIsMobile` (retorna o boolean direto) é a exceção legada aqui também — não replicar em hook novo.

## Dois tipos de hook nesta pasta

**1. Estado de UI/browser**, sem rede (`use-hover-capable.ts`, `use-mobile.ts`): `useState` + `useEffect` assinando um `matchMedia`/evento do browser, com cleanup no `return` do efeito.

**2. Wrapper de leitura de servidor** (`use-payment-method-status.ts`): encapsula um `useQuery` (do `@tanstack/react-query`, chamando um cliente de `src/http/`) e já resolve os valores padrão/derivados (`data?.hasOrganizationPaymentMethod ?? false`), pra quem consome o hook não precisar repetir esse fallback em todo componente:

```ts
export function usePaymentMethodStatus(params: { orgSlug: string }) {
  const { orgSlug } = params;
  const { data, isLoading } = useQuery({
    queryKey: ["organization-payment-method", orgSlug],
    queryFn: () => getOrganizationPaymentMethodStatusHttp({ orgSlug }),
  });

  return {
    hasPaymentMethod: data?.hasOrganizationPaymentMethod ?? false,
    isLoading,
  };
}
```

Sempre que a mesma query (`queryKey`) for lida em mais de um componente, prefira extrair um hook desse tipo em vez de repetir o `useQuery` cru em cada lugar — mantém o `queryKey` e o shape de retorno em um único ponto de verdade.
