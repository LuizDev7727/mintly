// Procura, num objeto de erros do react-hook-form (aninhado por post e por
// campo), a primeira mensagem de erro. Pula `ref`, que aponta para um elemento
// do DOM.
export function getFirstErrorMessage(errors: unknown): string | undefined {
  if (!errors || typeof errors !== "object") {
    return undefined;
  }

  const node = errors as Record<string, unknown>;

  if (typeof node.message === "string" && node.message) {
    return node.message;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "ref") {
      continue;
    }

    const message = getFirstErrorMessage(value);

    if (message) {
      return message;
    }
  }

  return undefined;
}
