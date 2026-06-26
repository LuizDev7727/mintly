import { z } from "zod";

export const updateFolderSchema = z.object({
  name: z.string(),
});

export type UpdateFolderFormType = z.infer<typeof updateFolderSchema>;
