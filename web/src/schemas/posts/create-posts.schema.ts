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
      affiliateUrl: z
        .string()
        .max(2048, { error: "The affiliate link is too long" })
        .refine(
          (value) => {
            const url = value.trim();
            if (!url) return true;
            return z.url({ protocol: /^https?$/ }).safeParse(url).success;
          },
          { error: "The affiliate link must be a valid http(s) URL" },
        ),
      socialsToPost: z
        .array(
          z.object({
            id: z.uuidv7(),
            name: z.string(),
            provider: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
            avatarUrl: z.string().nullable(),
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
