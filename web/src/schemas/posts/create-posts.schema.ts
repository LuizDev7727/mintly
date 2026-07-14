import { z } from "zod";

export const createPostSchema = z.object({
  posts: z.array(
    z.object({
      file: z.file(),
      duration: z.number().nullable(),
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
            id: z.uuidv7(),
            name: z.string(),
            provider: z.enum(["YOUTUBE", "TIKTOK"]),
          }),
        )
        .min(1, { error: "Post needs at least one integration selected" }),
      shouldGenerateThumbnail: z.boolean(),
      shouldGenerateVideoMetadata: z.boolean(),
      shouldGenerateShorts: z.boolean(),
    }),
  ),
});

export type CreatePostsFormType = z.infer<typeof createPostSchema>;
