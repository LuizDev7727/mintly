export function getFileExtension(name: string): string {
  return name.split(".").pop()?.toUpperCase() || "FILE";
}
