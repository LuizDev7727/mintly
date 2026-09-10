# src/context — Padrões e Convenções

Contexts React globais. **Poucos, de propósito** — a maior parte do estado compartilhado já passa por TanStack Query (server state, ver `src/lib/react-query.ts`) ou nuqs (estado em URL). Antes de criar um Context novo, considere se o estado não deveria estar num desses dois lugares — Context é pra estado de UI puramente client-side, sem persistência nem origem no servidor (ex: modo de visualização grid/list).

## Anatomia (`view-mode-context.tsx`)

Todo Context segue o mesmo formato — Context + Provider + hook de acesso que valida o uso dentro do Provider:

```tsx
import { createContext, useContext, useState } from "react";

type MyContextState = {
  value: string;
  setValue: (value: string) => void;
};

const initialState: MyContextState = {
  value: "default",
  setValue: () => null,
};

const MyContext = createContext<MyContextState>(initialState);

export function MyProvider({ children, ...props }: { children: React.ReactNode }) {
  const [value, setValue] = useState("default");

  return (
    <MyContext.Provider {...props} value={{ value, setValue }}>
      {children}
    </MyContext.Provider>
  );
}

export const useMy = () => {
  const context = useContext(MyContext);

  if (context === undefined) {
    throw new Error("useMy must be used within a MyProvider");
  }

  return context;
};
```

**Regras:**

- Nome do arquivo: `<nome>-context.tsx`, `kebab-case`.
- Sempre exportar três coisas: o tipo de estado (`<Nome>ContextState`), o `<Nome>Provider` e o hook `use<Nome>` — nunca exportar o Context (`createContext(...)`) diretamente pra fora do arquivo; consumo é sempre via hook.
- O hook de acesso lança erro explícito se usado fora do Provider correspondente — não deixar o consumo silenciosamente cair no `initialState`.
- `initialState` existe só como valor default do `createContext` (satisfaz o tipo) — o estado real sempre vem do `useState` dentro do Provider.
