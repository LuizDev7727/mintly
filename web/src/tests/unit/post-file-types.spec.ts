import {
  POST_FILE_ACCEPT,
  isImageFile,
  isSupportedPostFile,
} from "@/pages/orgs/$slug/channels/$channel/create-upload/-components/post-file-types";

describe("isSupportedPostFile", () => {
  it.each(["video/mp4", "image/jpeg", "image/png", "image/webp"])(
    "should accept %s",
    (type) => {
      expect(isSupportedPostFile({ type })).toBe(true);
    },
  );

  it.each(["image/gif", "video/quicktime", "application/pdf", ""])(
    "should reject %s",
    (type) => {
      expect(isSupportedPostFile({ type })).toBe(false);
    },
  );
});

describe("isImageFile", () => {
  it("should tell images from videos", () => {
    expect(isImageFile({ type: "image/webp" })).toBe(true);
    expect(isImageFile({ type: "video/mp4" })).toBe(false);
  });
});

describe("POST_FILE_ACCEPT", () => {
  it("should list every supported extension and type", () => {
    for (const item of [
      ".mp4", "video/mp4", ".jpg", ".jpeg", "image/jpeg",
      ".png", "image/png", ".webp", "image/webp",
    ]) {
      expect(POST_FILE_ACCEPT.split(",")).toContain(item);
    }
  });
});
