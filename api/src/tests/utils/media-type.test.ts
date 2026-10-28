import { describe, test, expect } from "vitest";
import {
  getCaptionFromFileName,
  isImageMimeType,
  needsJpegConversion,
} from "@/utils/media-type.ts";

describe("isImageMimeType", () => {
  test.each(["image/jpeg", "image/png", "image/webp"])(
    "should recognize %s as an image",
    (mimeType) => {
      expect(isImageMimeType(mimeType)).toBe(true);
    },
  );

  test.each(["video/mp4", "image/gif", "application/pdf", ""])(
    "should not recognize %s as a supported image",
    (mimeType) => {
      expect(isImageMimeType(mimeType)).toBe(false);
    },
  );
});

describe("needsJpegConversion", () => {
  test("should not convert a JPEG", () => {
    expect(needsJpegConversion("image/jpeg")).toBe(false);
  });

  test.each(["image/png", "image/webp"])("should convert %s", (mimeType) => {
    expect(needsJpegConversion(mimeType)).toBe(true);
  });

  test("should not convert a video", () => {
    expect(needsJpegConversion("video/mp4")).toBe(false);
  });
});

describe("getCaptionFromFileName", () => {
  test("should remove the extension", () => {
    expect(getCaptionFromFileName("sunset.jpg")).toEqual("sunset");
  });

  test("should only remove the last extension", () => {
    expect(getCaptionFromFileName("my.photo.final.png")).toEqual("my.photo.final");
  });

  test("should keep the name when there is nothing before the extension", () => {
    expect(getCaptionFromFileName(".png")).toEqual(".png");
  });

  test("should keep a name without extension", () => {
    expect(getCaptionFromFileName("sunset")).toEqual("sunset");
  });
});
