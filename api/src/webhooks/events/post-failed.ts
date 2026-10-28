import { z } from 'zod'

export const postFailedSchema = z.object({
  postId: z.string(),
  message: z.string(),
})
