import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(64),
  bio: z.string().max(160).optional(),
});

export type UpdateProfileFormType = z.infer<typeof updateProfileSchema>;
