# Trigger.dev — Padrões e Convenções

## Estrutura de Diretórios

```
src/trigger/tasks
├── orchestrator.trigger.ts        # Task principal que coordena as demais
├── step-a.trigger.ts              # Task atômica
├── step-b.trigger.ts              # Task atômica
└── step-c.trigger.ts              # Task atômica
```

Cada arquivo exporta uma única task. Tasks atômicas (que fazem uma única coisa) ficam separadas da task orquestradora, que as encadeia.

---

## Anatomia de uma Task

Toda task é definida com `schemaTask`, que vincula o payload a um schema Zod validado em runtime:

```typescript
import { logger, schemaTask } from '@trigger.dev/sdk'
import { z } from 'zod'

export const myTask = schemaTask({
  id: 'my-task',                  // ID único, usado para disparar a task
  schema: z.object({              // Payload tipado e validado
    resourceId: z.uuidv7(),
    url: z.url(),
  }),
  maxDuration: 300,               // Tempo máximo de execução em segundos
  run: async (payload, { ctx }) => {
    logger.log('Starting task', { resourceId: payload.resourceId })
    // lógica da task
    return { result: 'value' }    // retorno tipado, acessível em triggerAndWait
  },
})
```

- `id` — string em `kebab-case`, deve ser único em toda a aplicação.
- `schema` — Zod schema validado antes de `run` ser chamado.
- `maxDuration` — evita tasks presas indefinidamente. Defina sempre.
- `run` — função assíncrona que recebe o payload já tipado.

---

## Convenções de Nomenclatura

| O quê | Convenção | Exemplo |
|---|---|---|
| Arquivo | `kebab-case.trigger.ts` | `process-item.trigger.ts` |
| Export da task | `{ação}{Recurso}Task` | `processItemTask` |
| `id` da task | `kebab-case` | `"process-item"` |

---

## Lifecycle Hooks

Tasks podem declarar callbacks para os eventos de conclusão. Úteis para atualizar o status de um registro no banco:

```typescript
export const myTask = schemaTask({
  id: 'my-task',
  schema: z.object({ recordId: z.uuidv7() }),
  maxDuration: 300,

  onSuccess: async ({ payload }) => {
    await db.update(table).set({ status: 'SUCCESS' }).where(eq(table.id, payload.recordId))
  },

  onFailure: async ({ payload }) => {
    await db.update(table).set({ status: 'ERROR' }).where(eq(table.id, payload.recordId))
  },

  onCancel: async ({ payload }) => {
    await db.delete(table).where(eq(table.id, payload.recordId))
  },

  run: async (payload) => {
    // ...
  },
})
```

---

## Disparando Tasks

### Fire-and-forget (`tasks.trigger`)
Dispara a task sem aguardar o resultado. A execução continua imediatamente:

```typescript
import { tasks } from '@trigger.dev/sdk'
import type { myTask } from './my-task.trigger'

await tasks.trigger<typeof myTask>('my-task', {
  resourceId: id,
  url: 'https://...',
})
```

### Aguardar resultado (`tasks.triggerAndWait`)
Dispara a task e suspende a execução até que ela complete. Verifica `ok` antes de usar o `output`:

```typescript
const response = await tasks.triggerAndWait<typeof myTask>('my-task', {
  resourceId: id,
  url: 'https://...',
})

if (!response.ok) {
  return // task falhou, interrompe a execução da task atual
}

const { result } = response.output
```

> Use `triggerAndWait` quando o resultado de uma task é necessário como input da próxima. Use `trigger` quando as tasks podem rodar em paralelo ou quando o resultado não é necessário.

---

## Orquestração de Tasks

A task orquestradora encadeia tasks menores em sequência. Cada etapa depende do output da anterior:

```typescript
export const orchestratorTask = schemaTask({
  id: 'orchestrator',
  schema: z.object({ resourceId: z.uuidv7(), url: z.url() }),
  maxDuration: 300,

  run: async (payload) => {
    const { resourceId, url } = payload

    // Etapa 1 — fire-and-forget (não bloqueia)
    await tasks.trigger<typeof sideEffectTask>('side-effect', { url })

    // Etapa 2 — aguarda resultado para usar no próximo passo
    const stepAResponse = await tasks.triggerAndWait<typeof stepATask>('step-a', { url })

    if (!stepAResponse.ok) return

    const { intermediateResult } = stepAResponse.output

    // Etapa 3 — usa output da etapa anterior
    const stepBResponse = await tasks.triggerAndWait<typeof stepBTask>('step-b', {
      intermediateResult,
    })

    if (!stepBResponse.ok) return

    return { finalResult: stepBResponse.output.value }
  },
})
```

---

## Waitpoints

Waitpoints permitem pausar uma task e aguardar um evento externo (webhook, callback de API de terceiros) sem consumir tempo de computação.

### Padrão: Callback via Webhook

```typescript
import { wait } from '@trigger.dev/sdk'

// 1. Cria um token com timeout
const token = await wait.createToken({ timeout: '10m' })

// 2. Envia o token.url como webhook para o serviço externo
await externalService.run(input, {
  webhook: token.url,
  webhook_events_filter: ['completed'],
})

// 3. Aguarda o serviço chamar o webhook (task fica suspensa)
const result = await wait.forToken<ExpectedType>(token).unwrap()

// 4. Usa o resultado
const { data } = result
```

- `wait.createToken` — gera uma URL única que, quando chamada (via POST), resume a task.
- `wait.forToken(...).unwrap()` — suspende a task até o token ser chamado. Lança erro se o timeout expirar.
- Use `timeout` curto o suficiente para não bloquear recursos, mas longo o suficiente para o serviço externo responder.

### Padrão: Aguardar Data/Hora (`wait.until`)

Para tasks que devem ser processadas em um momento futuro (agendamento):

```typescript
if (scheduledAt) {
  logger.log('Waiting until scheduled time', { scheduledAt })
  await wait.until({ date: scheduledAt })
  // execução continua após a data
}
```

---

## Machine Size

Para tasks que processam arquivos grandes ou executam ferramentas pesadas, especifique o tamanho da máquina:

```typescript
export const heavyTask = schemaTask({
  id: 'heavy-task',
  machine: 'small-2x',   // mais CPU e memória
  schema: z.object({ url: z.url() }),
  maxDuration: 300,
  run: async (payload) => { /* ... */ },
})
```

Use `machine` apenas quando necessário — tasks simples não precisam.

---

## Logging

Use sempre `logger` do SDK em vez de `console.log`. Os logs ficam associados à execução da task no dashboard:

```typescript
import { logger } from '@trigger.dev/sdk'

logger.log('Processing started', { id: payload.resourceId })
logger.debug('FFmpeg output', { data: chunk.toString() })
logger.error('Process failed', { error })
```

---

## Salvando o `runId` no banco

Para permitir cancelamento posterior, salve o `ctx.run.id` no banco logo no início da `run`:

```typescript
run: async (payload, { ctx }) => {
  await db.update(table).set({ runId: ctx.run.id }).where(eq(table.id, payload.recordId))
  // ...
}
```

---

## Parsing de Respostas de LLMs

LLMs retornam JSON embutido em blocos de código markdown. Sempre limpe antes de fazer `JSON.parse`, e valide com Zod:

```typescript
const responseSchema = z.array(
  z.object({
    startTime: z.number(),
    title: z.string(),
    endTime: z.number(),
  })
)

const rawText = response.text ?? '[]'
const cleaned = rawText.replace(/```json|```/g, '').trim()
const parsed = responseSchema.parse(JSON.parse(cleaned))
```

---

## Processamento de Itens em Loop com Waitpoints

Quando cada item de uma lista precisa de um callback externo, crie um token por item e aguarde individualmente:

```typescript
for (const item of items) {
  const token = await wait.createToken({ timeout: '10m' })

  await externalService.process({
    item,
    callback_url: token.url,
  })

  logger.log(`Waiting for callback: ${item.title}`)
  const result = await wait.forToken<CallbackResponse>(token).unwrap()

  await db.insert(resultsTable).values({
    title: item.title,
    key: result.key,
    parentId: payload.parentId,
  })
}
```

---

## Executando Processos do Sistema (`spawn`)

Para executar ferramentas de linha de comando (ex: `ffmpeg`, `ffprobe`), use `spawn` do Node.js. Colete o output via stream:

```typescript
import { spawn } from 'node:child_process'

// Coletando output como string
let output = ''
const proc = spawn('tool', ['--flag', 'value', input])

for await (const chunk of proc.stdout) {
  output += chunk
}

const exitCode = await new Promise((resolve) => proc.on('close', resolve))
if (exitCode !== 0) throw new Error(`Process failed with code ${exitCode}`)

const data = JSON.parse(output)
```

```typescript
// Streaming output diretamente para upload (sem buffer em memória)
import { PassThrough } from 'node:stream'

const stream = new PassThrough()
const proc = spawn('tool', ['-f', 'pipe', 'pipe:1'])
proc.stdout.pipe(stream)

proc.stderr.on('data', (data) => logger.debug('tool:', data.toString()))
proc.on('error', (err) => stream.destroy(err))
```

---

## Upload via Streaming para Object Storage

Para arquivos grandes, use multipart upload com streaming para evitar carregar tudo em memória:

```typescript
import { Upload } from '@aws-sdk/lib-storage'
import { PassThrough } from 'node:stream'

const stream = new PassThrough()

const upload = new Upload({
  client: storageClient,
  params: {
    Bucket: BUCKET_NAME,
    Key: `path/to/${fileId}.ext`,
    Body: stream,
    ContentType: 'audio/mpeg',
  },
  queueSize: 4,              // partes paralelas
  partSize: 5 * 1024 * 1024, // 5MB por parte
  leavePartsOnError: false,
})

// Pipe do processo diretamente para o upload
proc.stdout.pipe(stream)

await upload.done()
```

---
