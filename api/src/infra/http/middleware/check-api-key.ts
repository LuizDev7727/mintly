import { db } from "@/infra/db/client.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { hashApiKey } from "@/utils/crypto/hash-api-key.ts";
import { eq } from "drizzle-orm";
import { FastifyRequest } from "fastify";

export async function checkApiKey(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  const apiKey = authorization.replace("Bearer ", "");
  const apiKeyHash = await hashApiKey(apiKey);

  const [organization] = await db
    .select({
      id: organizationsTable.id,
      slug: organizationsTable.slug,
      name: organizationsTable.name,
      ownerId: organizationsTable.ownerId,
    })
    .from(organizationsTable)
    .where(
      eq(organizationsTable.apiKeyHash, apiKeyHash)
    );

  if (!organization) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  request.organization = organization;
}
