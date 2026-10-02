import { z } from "zod";

export const updateBillingEmailSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export type UpdateBillingEmailFormType = z.infer<
  typeof updateBillingEmailSchema
>;
