import { z } from "zod";

export const createChannelSchema = z.object({
  name: z.string(),
});

export type CreateChannelFormType = z.infer<typeof createChannelSchema>;
