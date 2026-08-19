import { z } from 'zod'

export const postFailedSchema = z.object({
  message: z.string(),
})
