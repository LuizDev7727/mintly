import { z } from "zod";

export const createInviteMemberSchema = z.object({
  email: z.email(),
});

export type CreateInviteMemberFormType = z.infer<
  typeof createInviteMemberSchema
>;
