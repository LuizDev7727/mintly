import { createPostSchema } from "@/schemas/posts/create-posts.schema";

function makePost(affiliateUrl: string) {
  return {
    posts: [
      {
        file: new File(["x"], "clip.mp4", { type: "video/mp4" }),
        duration: 10,
        scheduledTo: null,
        affiliateUrl,
        socialsToPost: [
          {
            id: "0190a8f0-0000-7000-8000-000000000000",
            name: "Channel",
            provider: "YOUTUBE" as const,
            avatarUrl: null,
          },
        ],
        shouldGenerateThumbnail: false,
        shouldGenerateVideoMetadata: false,
        shouldGenerateShorts: false,
      },
    ],
  };
}

describe("createPostSchema affiliateUrl", () => {
  test.each(["", "   ", "https://example.com/p?ref=1", "http://example.com"])(
    "should accept %j",
    (affiliateUrl) => {
      expect(createPostSchema.safeParse(makePost(affiliateUrl)).success).toBe(true);
    },
  );

  test.each(["javascript:alert(1)", "ftp://example.com", "not a url"])(
    "should reject %j",
    (affiliateUrl) => {
      const result = createPostSchema.safeParse(makePost(affiliateUrl));

      expect(result.success).toBe(false);
    },
  );
});
