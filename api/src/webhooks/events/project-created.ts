import { z } from 'zod'

export const projectCreatedSchema = z.object({
  message: z.string(),
})
