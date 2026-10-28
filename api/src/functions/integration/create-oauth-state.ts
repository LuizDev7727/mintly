import { randomBytes } from "node:crypto";
import { lt } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import type { providerEnum } from "@/infra/db/tables/integrations.table.ts";
import { oauthStatesTable } from "@/infra/db/tables/oauth-state.table.ts";

// Tempo para o usuário concluir o login no provedor.
const OAUTH_STATE_TTL_IN_MS = 10 * 60 * 1000;

type CreateOAuthStateParams = {
  provider: (typeof providerEnum.enumValues)[number];
  userId: string;
  orgSlug: string;
  channelId: string;
};

type CreateOAuthStateResponse = {
  state: string;
};

export async function createOAuthState(
  params: CreateOAuthStateParams,
): Promise<CreateOAuthStateResponse> {
  const { provider, userId, orgSlug, channelId } = params;

  // Quem começa e não termina o login deixa uma linha para trás; limpa a cada
  // emissão em vez de manter um job só para isso.
  await db
    .delete(oauthStatesTable)
    .where(lt(oauthStatesTable.expiresAt, new Date()));

  const state = randomBytes(32).toString("hex");

  await db.insert(oauthStatesTable).values({
    id: state,
    provider,
    userId,
    organizationSlug: orgSlug,
    channelId,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_IN_MS),
  });

  return { state };
}
