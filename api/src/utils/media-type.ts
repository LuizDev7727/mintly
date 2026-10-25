export const VIDEO_MIME_TYPES = ["video/mp4"] as const;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const POST_MIME_TYPES = [...VIDEO_MIME_TYPES, ...IMAGE_MIME_TYPES] as const;

export function isImageMimeType(mimeType: string) {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

// A API do Instagram só aceita JPEG como imagem; PNG e WebP precisam ser
// convertidos antes de publicar.
export function needsJpegConversion(mimeType: string) {
  return isImageMimeType(mimeType) && mimeType !== "image/jpeg";
}

// Legenda de um post de imagem: o nome do arquivo sem a extensão. Uma imagem não
// tem áudio para transcrever, então não há título gerado por SEO.
export function getCaptionFromFileName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^./\\]+$/, "").trim();

  return withoutExtension || fileName;
}
