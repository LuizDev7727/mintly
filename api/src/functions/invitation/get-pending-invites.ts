import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { and, eq } from "drizzle-orm";

type GetPendingInvitesParams = {
  email: string;
};

export async function getPendingInvites({ email }: GetPendingInvitesParams) {
  const invites = await db
    .select({
      id: invitationsTable.id,
      role: invitationsTable.role,
      createdAt: invitationsTable.createdAt,
      organization: {
        id: organizationsTable.id,
        name: organizationsTable.name,
        slug: organizationsTable.slug,
        logo: organizationsTable.logo,
      },
      author: {
        name: usersTable.name,
        avatarUrl: usersTable.image,
      },
    })
    .from(invitationsTable)
    .innerJoin(
      organizationsTable,
      eq(invitationsTable.organizationSlug, organizationsTable.slug),
    )
    .innerJoin(usersTable, eq(invitationsTable.inviterId, usersTable.id))
    .where(
      and(
        eq(invitationsTable.email, email),
        eq(invitationsTable.status, "pending"),
      ),
    );

  return { invites };
}
