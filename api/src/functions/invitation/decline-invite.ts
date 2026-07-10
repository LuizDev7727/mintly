import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { UserNotBelongsToTheOrganizationError } from "@/errors/user-not-belongs-to-the-organization.ts";
import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { eq } from "drizzle-orm";

type DeclineInviteParams = {
  inviteId: string;
  email: string;
};

export async function declineInvite(
  params: DeclineInviteParams,
): Promise<void> {
  const { inviteId, email } = params;

  const [invite] = await db
    .select()
    .from(invitationsTable)
    .where(eq(invitationsTable.id, inviteId));

  if (!invite) {
    throw new ResourceNotFoundError("Invite not found");
  }

  if (invite.email !== email) {
    throw new UserNotBelongsToTheOrganizationError();
  }

  await db
    .update(invitationsTable)
    .set({ status: "declined" })
    .where(eq(invitationsTable.id, inviteId));
}
