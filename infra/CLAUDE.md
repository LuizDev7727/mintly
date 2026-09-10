# infra/ — Convenções

Pulumi (TypeScript, AWS) provisionando o ambiente de staging da API. Ver [`README.md`](./README.md) para o que é provisionado e como fazer deploy — este arquivo cobre como estender o código.

## Estado atual

Um único arquivo (`index.ts`), sem separar recursos em módulos — normal pro tamanho atual (ECS Cluster + Service + Task Definition + IAM Role + Security Group). Se a infra crescer bastante, considerar dividir por domínio (ex: `network.ts`, `ecs.ts`), mas não introduzir essa estrutura preventivamente enquanto for só isso.

## Nome lógico Pulumi vs nome do recurso AWS

Os dois nomes são independentes e já divergem no código existente — sempre dar os dois explicitamente, nunca confiar que o nome lógico vira o nome do recurso:

```ts
// "api-cluster" é só o nome lógico dentro do state do Pulumi.
// "mintly-api-staging-cluster" é o nome real que aparece no console da AWS.
const cluster = new aws.ecs.Cluster("api-cluster", {
  name: "mintly-api-staging-cluster",
});
```

Ao adicionar um recurso novo, siga o padrão `mintly-api-staging-<recurso>` pro nome AWS — a Task Definition atual (`family: "minha-api-task"`) é uma exceção que ficou genérica do template original; não replicar esse padrão em recursos novos.

## Variáveis de ambiente do container

Vêm de `process.env` **no momento do `pulumi up`**, via `pulumi.interpolate` dentro do JSON da `containerDefinitions` — não são `pulumi config`/secrets do Pulumi. Isso significa: quem/o que roda `pulumi up` (dev local ou CI) precisa ter essas variáveis exportadas no ambiente *antes* de rodar o comando, senão a task sobe com valores vazios. Ao adicionar uma env var nova pro container da API, seguir o mesmo padrão (adicionar ao array `environment` da `containerDefinitions`, referenciando `process.env.NOME_DA_VAR`), e documentar a chave nova no `README.md`.

## Stack `dev` vs recursos "staging"

O único stack configurado é `Pulumi.dev.yaml` (`pulumi stack select dev`), mas todos os recursos são nomeados com `-staging-` (`mintly-api-staging-cluster`, ECR `mintly-api-staging`, etc). Ou seja, o stack Pulumi chamado "dev" é, na prática, o ambiente de staging da aplicação — não confundir com um ambiente de desenvolvimento local. Se um stack de produção for adicionado no futuro, manter essa mesma convenção de nome de recurso AWS (`mintly-api-<ambiente>-<recurso>`) coerente com o ambiente real, não com o nome do stack Pulumi.

## Rede

Usa a VPC/subnets **default** da conta (`aws.ec2.getVpc({ default: true })`), não uma VPC dedicada. Se isso mudar (VPC própria), atualizar também o Security Group e a `networkConfiguration` do Service juntos — eles dependem um do outro via `subnets`/`vpcId`.
