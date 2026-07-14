import { z } from "zod";

export const createPostSchema = z.object({
  post: z.object({
    filename: z.string(),
    shouldGenerateThumbnail: z.boolean(),
    shouldGenerateShorts: z.boolean(),
    scheduledTo: z
      .string()
      .nullable()
      .refine(
        (dateSelected) => {
          if (!dateSelected) return true;
          return new Date(dateSelected) > new Date();
        },
        { error: "The date cannot be in the past" },
      ),
    socialsToPost: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          provider: z.enum(["YOUTUBE", "TIKTOK"]),
        }),
      )
      .min(1, { error: "Post needs at least one integration selected" }),
  }),
  postId: z.uuidv7(),
})
