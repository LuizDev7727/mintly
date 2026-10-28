import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";

type AssertKeyOwnedByUserProps = {
  key: string;
  userId: string;
};

// As chaves de upload nascem como `<userId>/<uuid>` (ver
// generateUploadSignedUrls). Uma chave que não começa com o id de quem a
// apresenta é de outro usuário ou veio de fora do fluxo de upload. Responde
// como um arquivo inexistente, para a resposta não revelar que a chave existe.
export function assertKeyOwnedByUser(props: AssertKeyOwnedByUserProps) {
  const { key, userId } = props;

  if (!key.startsWith(`${userId}/`)) {
    throw new ResourceNotFoundError("File not found");
  }
}
