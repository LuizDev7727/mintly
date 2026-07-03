import { z } from "zod";

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(32),
});

export type UpdateChannelFormType = z.infer<typeof updateChannelSchema>;
