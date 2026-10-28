// Tipos de arquivo que um post aceita. Precisa bater com `POST_MIME_TYPES` da
// API (`api/src/utils/media-type.ts`), que recusa o resto com 400.
const VIDEO_TYPES = ["video/mp4"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST_FILE_ACCEPT = [
  ".mp4,video/mp4",
  ".jpg,.jpeg,image/jpeg",
  ".png,image/png",
  ".webp,image/webp",
].join(",");

export function isImageFile(file: Pick<File, "type">) {
  return IMAGE_TYPES.includes(file.type);
}

export function isSupportedPostFile(file: Pick<File, "type">) {
  return VIDEO_TYPES.includes(file.type) || isImageFile(file);
}
