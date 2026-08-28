import { z } from "zod"

export const getProjectsContract = z.array(z.object({
  id: z.uuidv7(),
  name: z.string(),
}))

export type GetProjectsContract = z.infer<typeof getProjectsContract>
