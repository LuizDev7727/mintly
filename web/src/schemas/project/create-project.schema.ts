import { z } from "zod";

export const createProjectSchema = z.object({
  file: z.file(),
});

export type CreateProjectFormType = z.infer<typeof createProjectSchema>;
