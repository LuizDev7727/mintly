import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { and, eq } from "drizzle-orm";

type RevokeInviteParams = {
  orgSlug: string;
  inviteId: string;
};

export async function revokeInvite(params: RevokeInviteParams): Promise<void> {
  const { orgSlug, inviteId } = params;

  const [{ organizationSlug }] = await db
    .select({ organizationSlug: organizationsTable.slug })
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, orgSlug));

  const [deleted] = await db
    .delete(invitationsTable)
    .where(
      and(
        eq(invitationsTable.id, inviteId),
        eq(invitationsTable.organizationSlug, organizationSlug),
      ),
    )
    .returning({ id: invitationsTable.id });

  if (!deleted) {
    throw new ResourceNotFoundError("Invite not found");
  }
}
