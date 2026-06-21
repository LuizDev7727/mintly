import { z } from "zod";

export const inspirationalThumbnailsSchema = z.object({
  inspirationalThumbnails: z.array(
    z.object({
      file: z.file(),
    }),
  ),
});

export type InspirationalThumbnailsFormType = z.infer<
  typeof inspirationalThumbnailsSchema
>;
