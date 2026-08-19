import { z } from 'zod'
import { postCreatedSchema } from './events/post-created.ts'
import { postFailedSchema } from './events/post-failed.ts'
import { postPostedSchema } from './events/post-posted.ts'
import { projectCreatedSchema } from './events/project-created.ts'

export const webhookEventSchema = z.discriminatedUnion('trigger', [
  z.object({
    trigger: z.literal('post.created'),
    deliverTo: z.url(),
    webhookId: z.uuid(),
    numberOfRetries: z.number(),
    payload: postCreatedSchema,
  }),
  z.object({
    trigger: z.literal('post.failed'),
    deliverTo: z.url(),
    webhookId: z.uuid(),
    numberOfRetries: z.number(),
    payload: postFailedSchema,
  }),
  z.object({
    trigger: z.literal('post.posted'),
    deliverTo: z.url(),
    webhookId: z.uuid(),
    numberOfRetries: z.number(),
    payload: postPostedSchema,
  }),
  z.object({
    trigger: z.literal('project.created'),
    deliverTo: z.url(),
    webhookId: z.uuid(),
    numberOfRetries: z.number(),
    payload: projectCreatedSchema,
  }),
])

export type WebhookEvent = z.infer<typeof webhookEventSchema>
