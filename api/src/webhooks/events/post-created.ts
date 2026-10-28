import { z } from 'zod'

export const postCreatedSchema = z.object({
  // Opcional porque mensagens publicadas antes deste campo ainda podem estar na
  // fila do QStash; o código novo sempre o envia.
  eventId: z.string().optional(),
  message: z.string(),
})
