import { z } from 'zod'

export const postPostedSchema = z.object({
  postId: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
})
