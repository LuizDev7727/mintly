type SanitizeFilenameProps = {
  filename: string;
};

export function sanitizeFilename({ filename }: SanitizeFilenameProps) {
  let title = filename.trim();

  // removeExt
  title = title.replace(/\.[a-zA-Z0-9]{2,5}$/, "");

  // removeUnderscores
  title = title.replace(/_+/g, " ");

  // removeDuplicatePunct
  title = title.replace(/([!?.,;:_\-])\1+/g, "$1");
  title = title.replace(/([!?.,;:])\s*([!?.,;:])+/g, "$1");
  title = title.replace(/\s*[:_\-]\s*(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s])/g, " ");
  title = title.replace(/\s*[:_\-]\s*$/g, "");

  // trimSpaces
  title = title.replace(/\s{2,}/g, " ").trim();

  return title;
}
