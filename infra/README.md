# Mintly — Infraestrutura (staging)

Infraestrutura como código via [Pulumi](https://www.pulumi.com) (TypeScript, provider AWS). Provisiona o ambiente de **staging** da API (`api/`) em ECS Fargate. Não é mais o template genérico do Pulumi (`aws-typescript`) — já foi customizado especificamente pra esse deploy.

## O que é provisionado (`index.ts`)

- **ECR**: lookup de um repositório já existente (`mintly-api-staging`) — a imagem é publicada por fora deste código (CI faz o `docker push` antes do `pulumi up`; este Pulumi não builda nem envia a imagem).
- **ECS Cluster** (`mintly-api-staging-cluster`) + **Service** (Fargate, `desiredCount: 1`, IP público).
- **Task Definition**: 1 container, porta `3000`, `cpu: 256` / `memory: 512`, variáveis de ambiente repassadas de `process.env` no momento do `pulumi up` (ver seção abaixo).
- **IAM Role** de execução da task (`AmazonECSTaskExecutionRolePolicy`).
- **Security Group**: ingress liberado em `0.0.0.0/0` na porta 3000 (sem restrição de origem — ambiente de staging).
- **Rede**: usa a VPC e as subnets **default** da conta AWS, não cria uma VPC própria.

> Nota: a `Task Definition` está com `family: "minha-api-task"` — nome genérico deixado do template original, não renomeado para `mintly-api-task`. Não afeta o funcionamento, mas é o nome que vai aparecer no console da AWS.

## Pré-requisitos

- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/) (>= v3)
- Node.js + pnpm
- Credenciais AWS configuradas (`aws configure` ou variáveis de ambiente) com permissão para ECS, ECR, IAM e EC2 (security group)
- O repositório ECR `mintly-api-staging` já precisa existir (não é criado por este código)

## Variáveis de ambiente necessárias

Lidas de `process.env` no momento do `pulumi up` e injetadas no container:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Postgres |
| `BETTER_AUTH_URL` | URL base do better-auth |
| `BETTER_AUTH_SECRET` | Secret do better-auth |
| `ALLOWED_ORIGIN` | Origem permitida por CORS |
| `OTEL_SERVICE_NAME` | Nome do serviço no OpenTelemetry |
| `OTEL_TRACES_EXPORTER` | Exporter de traces configurado |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Endpoint do coletor OTLP |
| `OTEL_EXPORTER_OTLP_HEADERS` | Headers de autenticação do coletor OTLP |

## Configuração do stack (`Pulumi.dev.yaml`)

| Config | Valor atual | Descrição |
|---|---|---|
| `aws:region` | `us-east-1` | Região AWS de deploy |
| `infra:imageTag` | `latest` | Tag da imagem no ECR a ser deployada — sobrescrever com a tag real do build antes de um `pulumi up` em CI |

## Deploy

```bash
cd infra
pulumi stack select dev   # ou o stack correspondente
pulumi config set infra:imageTag <tag-da-imagem>   # se for diferente de "latest"
pulumi preview
pulumi up
```

## Estrutura

```
infra/
├── index.ts          # programa Pulumi (cluster, task definition, service, security group, IAM)
├── Pulumi.yaml         # metadata do projeto (runtime, package manager)
├── Pulumi.dev.yaml      # config do stack "dev" (região, imageTag)
├── package.json           # dependências (@pulumi/aws, @pulumi/awsx, @pulumi/pulumi)
└── tsconfig.json
```
