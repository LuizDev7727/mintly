import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { and, eq } from "drizzle-orm";

type GetMembersParams = {
  orgSlug: string;
};

export async function getMembers({ orgSlug }: GetMembersParams) {
  const [{ organizationId }] = await db
    .select({ organizationId: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, orgSlug));

  const [members, pendingInvites] = await Promise.all([
    db
      .select({
        id: membersTable.id,
        role: membersTable.role,
        createdAt: membersTable.createdAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          avatarUrl: usersTable.image,
        },
      })
      .from(membersTable)
      .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
      .where(eq(membersTable.organizationSlug, orgSlug)),

    db
      .select({
        id: invitationsTable.id,
        email: invitationsTable.email,
        role: invitationsTable.role,
        createdAt: invitationsTable.createdAt,
      })
      .from(invitationsTable)
      .where(
        and(
          eq(invitationsTable.organizationSlug, orgSlug),
          eq(invitationsTable.status, "pending"),
        ),
      ),
  ]);

  return {
    members,
    pendingInvites,
  };
}
