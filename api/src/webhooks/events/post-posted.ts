import { z } from 'zod'

export const postPostedSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
})
