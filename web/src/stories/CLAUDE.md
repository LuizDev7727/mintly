# Storybook

## Quando criar uma story

Crie stories **apenas para componentes customizados** — componentes que você construiu para o projeto.

**Não crie stories para:**
- Componentes do shadcn/ui (`Button`, `Input`, `Dialog`, `Card`, etc.) — eles já têm sua própria documentação e testes
- Páginas — use testes E2E em `src/tests/e2e/` para validar fluxos de página
- Wrappers triviais que só repassam props sem lógica própria

**Crie stories para:**
- Componentes customizados em `src/components/` que combinam múltiplos primitivos do shadcn/ui
- Componentes com variantes, estados ou lógica própria que valem documentar visualmente
- Componentes de layout ou composição específicos do Mintly

**Regra prática:** se o componente tem variantes, estados visuais distintos (vazio, carregando, erro, cheio) ou lógica de interação própria, vale uma story.

---

## Estrutura de arquivos

O componente fica em `src/components/` e a story fica em `src/stories/` — nunca crie o componente dentro de `src/stories/`.

```
src/
├── components/
│   └── meu-componente.tsx       # componente
└── stories/
    └── MeuComponente.stories.tsx  # story
```

O nome do arquivo de story deve ser o PascalCase do componente seguido de `.stories.tsx`.

---

## Estrutura de uma story

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MeuComponente } from "@/components/meu-componente";

const meta = {
  title: "Components/MeuComponente",
  component: MeuComponente,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
    },
  },
} satisfies Meta<typeof MeuComponente>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Texto padrão",
  },
};

export const Destructive: Story = {
  args: {
    label: "Deletar",
    variant: "destructive",
  },
};
```

---

## Convenções

- `title` segue o padrão `"Components/<NomeDoComponente>"` para aparecer agrupado no sidebar
- Exporte sempre um `Default` como story base
- Crie uma story por estado ou variante relevante — não agrupe tudo em uma só
- Use `args` para dados dinâmicos e `parameters.layout: "centered"` para componentes isolados

---

## Testes de interação com `play()`

Use `play()` quando o componente tem comportamento interativo que vale testar (ex: abrir um dropdown, submeter um form, mostrar um toast). As stories com `play()` são executadas automaticamente pelo Vitest no browser via Playwright.

```tsx
import { expect, userEvent, within } from "@storybook/test";

export const ComInteracao: Story = {
  args: {
    label: "Clique aqui",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Clique aqui" }));

    await expect(canvas.getByText("Ação executada")).toBeVisible();
  },
};
```

---

## Acessibilidade

O addon `@storybook/addon-a11y` está ativo. Ao abrir uma story, a aba **Accessibility** mostra violações de contraste, ARIA e semântica. Corrija qualquer violação antes de considerar o componente pronto.

---

## Rodando o Storybook

```bash
# modo desenvolvimento
pnpm storybook

# rodar stories como testes (via Vitest + Playwright)
pnpm test:unit
```
