# Mintly — Claude Instructions

## Git Flow

Este projeto segue Git Flow estrito. **Nunca crie PRs diretamente para `main`.**

```
feature/* → development → staging → main
```

- **Features e fixes**: abrir PR de `feature/*` para `development`
- **Release**: abrir PR de `development` para `staging`
- **Deploy**: abrir PR de `staging` para `main`

Ao criar qualquer PR com `gh pr create`, sempre passar `--base development` (ou a branch correta do fluxo). Nunca omitir `--base` para evitar que o GitHub use `main` como padrão.
