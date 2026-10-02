import { z } from "zod";

// Campo vazio significa gasto ilimitado.
export const updateSpendingLimitSchema = z.object({
  spendingLimit: z
    .string()
    .refine(
      (value) =>
        value.trim() === "" ||
        (Number.isFinite(Number(value)) && Number(value) > 0),
      "Enter an amount greater than zero, or leave empty for unlimited",
    ),
});

export type UpdateSpendingLimitFormType = z.infer<
  typeof updateSpendingLimitSchema
>;
