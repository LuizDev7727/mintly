import { z } from "zod";

export const createProjectSchema = z.object({
  files: z
    .array(
      z.object({
        file: z.file(),
        duration: z.number().nullable(),
      }),
    )
    .min(1, { error: "Select at least one video" }),
});

export type CreateProjectFormType = z.infer<typeof createProjectSchema>;
