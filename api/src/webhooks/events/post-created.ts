import { z } from 'zod'

export const postCreatedSchema = z.object({
  message: z.string(),
})
