import { z } from "zod";

export const createProjectSchema = z.object({
  file: z
    .file()
    // .max(MAX_FILE_SIZE_BYTES, "File must be 256MB or smaller"),
});

export type CreateProjectFormType = z.infer<typeof createProjectSchema>;
