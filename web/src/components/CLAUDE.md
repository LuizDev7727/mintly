# src/components — Padrões e Convenções

Componentes React **compartilhados entre rotas**. Componente usado só numa página fica colocalizado em `src/pages/<rota>/-components/` (ver `web/CLAUDE.md`) — antes de criar um arquivo aqui, confirmar que ele realmente precisa ser global.

## `ui/` — primitivos shadcn

Gerados pela CLI do shadcn (`button.tsx`, `dialog.tsx`, `input.tsx`, `sidebar.tsx`, etc.) — a base do design system. **Não editar à mão para customizar estilo**; regenerar/atualizar via CLI do shadcn. Composições em cima desses primitivos (ex: um card específico de domínio) não entram em `ui/` — ficam soltos em `components/` (compartilhado) ou em `-components/` (local da rota).

Alguns arquivos em `ui/` já são compostos além do shadcn puro (`chart.tsx` — wrapper do Recharts, `code-block.tsx`, `cropper.tsx`, `copy-button.tsx`) — esses são customizações do projeto que vivem aqui por convenção de já estarem nesse nível de abstração (primitivo reutilizável), não porque vieram da CLI.

## Fora de `ui/` — componentes de domínio compartilhados

Arquivos soltos em `src/components/*.tsx` (sem subpasta) são o padrão dominante: componentes usados em mais de uma rota, cada um numa responsabilidade única — navegação/shell (`app-sidebar.tsx`, `nav-*.tsx`, `organization-switcher.tsx`, `channel-switcher.tsx`, `theme-*.tsx`), formulários reaproveitados (`create-channel-form.tsx`, `create-organization-form.tsx`), ícones de provider (`tiktok-icon.tsx`, `youtube-icon.tsx`, `provider-icons.tsx`) etc.

**Nota**: existe uma única subpasta de domínio, `profile/` (`update-profile-form.tsx`) — é exceção isolada, não um padrão de "uma subpasta por domínio" a ser replicado. Formulários de domínio equivalentes (`create-channel-form.tsx`, `create-organization-form.tsx`, `update-profile-dialog.tsx`) ficam soltos no nível de `components/`, não em subpastas. Ao adicionar um componente de domínio novo, siga o padrão majoritário (arquivo solto), a menos que alinhado explicitamente o contrário.

## Nomenclatura

`kebab-case.tsx`, um componente principal por arquivo, export nomeado (não `export default`) — consistente com o resto do projeto (`src/lib/CLAUDE.md`, `src/utils/CLAUDE.md`).
