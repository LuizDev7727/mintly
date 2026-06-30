export function createSlug(text: string): string {
  return text
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove chars inválidos
    .replace(/\s+/g, "-") // troca espaços por -
    .replace(/-+/g, "-"); // evita múltiplos ---
}
