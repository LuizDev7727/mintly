import { z } from "zod";

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(32),
});

export type UpdateOrganizationFormType = z.infer<
  typeof updateOrganizationSchema
>;
