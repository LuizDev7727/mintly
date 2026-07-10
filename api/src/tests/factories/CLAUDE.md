# Factories

Factories geram dados falsos (fake data) para os testes, mantendo a criação de entidades centralizada e reutilizável em vez de duplicar objetos literais em cada arquivo `*.test.ts`.

## File naming

`make-fake-<entity>.ts` — export em camelCase que casa com o nome do arquivo.

```
make-fake-user.ts          → makeFakeUser()
make-fake-organization.ts  → makeFakeOrganization()
make-fake-invitation.ts    → makeFakeInvitation()
```

Um arquivo por entidade. Sem barrel `index.ts` — importe direto do arquivo.

## O tipo utilitário `Replace`

Todo `Overrides` é derivado do tipo de props da entidade usando `Replace`, que troca os tipos de algumas chaves sem precisar redeclarar o objeto inteiro:

```ts
// src/tests/factories/replace.ts
export type Replace<T, R> = Omit<T, keyof R> & R;
```

Use `Replace` quando o campo precisa ficar opcional no `Overrides` (todo campo de uma factory é opcional, então isso é sempre o caso) ou quando o tipo do campo aceito pela factory é mais permissivo que o tipo real da entidade (ex: aceitar `string` onde a entidade espera um enum).

## Anatomia de uma factory

```ts
import { faker } from "@faker-js/faker";
import type { Replace } from "../replace.ts";

type Overrides = Partial<
  Replace<
    UserProps,
    {
      email?: string;
      createdAt?: Date;
    }
  >
>;

export function makeFakeUser(data = {} as Overrides) {
  const email = faker.internet.email();
  const createdAt = faker.date.past();

  const props: UserProps = {
    email: data.email || email,
    createdAt: data.createdAt || createdAt,
  };

  const user = User.create(props);

  return user;
}
```

**Regras:**

- O parâmetro é sempre `data = {} as Overrides` — nunca obrigatório, sempre com default vazio.
- Gere os valores fake primeiro (`const email = faker...`), depois monte o objeto `props` aplicando os overrides com `data.campo || valorFake`.
- Monte um objeto `props` tipado explicitamente com o tipo de props da entidade — nunca espalhe (`...data`) direto no retorno.
- `Overrides` é sempre `Partial<Replace<...>>` — mesmo que nenhum campo precise trocar de tipo, ainda existe o `Replace` (basta o segundo argumento genérico ser `{}` nesse caso) para deixar explícito de onde vêm os tipos de props.
- Nunca use `any` para tipar `data` — o `Overrides` deriva sempre do tipo de props real da entidade.

## De onde vem `<Entity>Props`

Este projeto não tem uma camada de entidades de domínio (`Entity.create`) — os dados são linhas de tabelas Drizzle. Nesse caso, `<Entity>Props` é o tipo de inserção da table:

```ts
import type { usersTable } from "@/infra/db/tables/users.table.ts";

type UserProps = typeof usersTable.$inferInsert;
```

E o "create" da factory é apenas retornar o objeto de props pronto para inserir:

```ts
export function makeFakeUser(data = {} as Overrides) {
  const email = faker.internet.email();
  const createdAt = faker.date.past();

  const props: UserProps = {
    email: data.email || email,
    createdAt: data.createdAt || createdAt,
  };

  return props;
}
```

Se no futuro o projeto ganhar uma camada de entidades (`User.create(props)`), a factory deve chamar essa entidade em vez de retornar `props` cru — a estrutura de `Overrides`/`props` continua a mesma.

## Valores fake

- Sempre use `@faker-js/faker` para gerar os valores default — nunca hardcode strings/datas fixas.
- Gere apenas os campos que fazem sentido serem sobrescrevíveis nos testes (os que aparecem em `Overrides`). Campos que nunca variam entre testes (ex: um `id` gerado pelo banco) não entram na factory.
- Prefira o gerador de faker mais específico para o campo (`faker.internet.email()`, `faker.person.fullName()`, `faker.date.past()`) em vez de `faker.string.alphanumeric()` genérico.

## Uso em testes

```ts
import { makeFakeUser } from "@/tests/factories/make-fake-user.ts";

const user = makeFakeUser({ email: "fixed@example.com" });
```

Overrides só devem ser passados quando o valor importa para a asserção do teste — o resto fica com o fake gerado pela factory.
