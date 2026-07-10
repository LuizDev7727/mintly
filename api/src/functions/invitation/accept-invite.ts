import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { UserNotBelongsToTheOrganizationError } from "@/errors/user-not-belongs-to-the-organization.ts";
import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { eq } from "drizzle-orm";

type AcceptInviteParams = {
  inviteId: string;
  userId: string;
  email: string;
};

export async function acceptInvite(params: AcceptInviteParams): Promise<void> {
  const { inviteId, userId, email } = params;

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

  await db.transaction(async (tx) => {
    await tx.insert(membersTable).values({
      organizationSlug: invite.organizationSlug,
      userId,
      role: invite.role ?? "member",
      createdAt: new Date(),
    });

    await tx
      .update(invitationsTable)
      .set({ status: "accepted" })
      .where(eq(invitationsTable.id, inviteId));
  });
}
