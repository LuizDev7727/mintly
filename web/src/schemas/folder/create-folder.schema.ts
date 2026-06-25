import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string(),
});

export type CreateFolderFormType = z.infer<typeof createFolderSchema>;
