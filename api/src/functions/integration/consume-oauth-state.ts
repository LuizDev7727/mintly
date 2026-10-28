import { and, eq, gt } from "drizzle-orm";
import { InvalidOAuthStateError } from "@/errors/invalid-oauth-state.error.ts";
import { db } from "@/infra/db/client.ts";
import type { providerEnum } from "@/infra/db/tables/integrations.table.ts";
import { oauthStatesTable } from "@/infra/db/tables/oauth-state.table.ts";

type ConsumeOAuthStateParams = {
  provider: (typeof providerEnum.enumValues)[number];
  state: string;
};

type ConsumeOAuthStateResponse = {
  userId: string;
  orgSlug: string;
  channelId: string;
};

// Um `state` vale uma vez, para o provedor que o pediu e até expirar. O delete
// com `returning` valida e consome numa só instrução: dois callbacks com o mesmo
// `state` não passam os dois.
export async function consumeOAuthState(
  params: ConsumeOAuthStateParams,
): Promise<ConsumeOAuthStateResponse> {
  const { provider, state } = params;

  const [oauthState] = await db
    .delete(oauthStatesTable)
    .where(
      and(
        eq(oauthStatesTable.id, state),
        eq(oauthStatesTable.provider, provider),
        gt(oauthStatesTable.expiresAt, new Date()),
      ),
    )
    .returning({
      userId: oauthStatesTable.userId,
      orgSlug: oauthStatesTable.organizationSlug,
      channelId: oauthStatesTable.channelId,
    });

  if (!oauthState) {
    throw new InvalidOAuthStateError();
  }

  return oauthState;
}
