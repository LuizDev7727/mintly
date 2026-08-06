import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, eq } from "drizzle-orm";

type GetMembersParams = {
  orgSlug: string;
};

export async function getMembers({ orgSlug }: GetMembersParams) {

  const [result, pendingInvites] = await Promise.all([
    db
      .select({
        id: membersTable.id,
        role: membersTable.role,
        createdAt: membersTable.createdAt,
        user: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          image: usersTable.image,
          bio: usersTable.bio,
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

  const members = await Promise.all(
    result.map(async ({ id, role, createdAt, user }) => {
      const avatarUrl = user.image
        ? await generateSignedUrl({ key: user.image })
        : null;

      return {
        id,
        role,
        createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl,
          bio: user.bio,
        },
      };
    }),
  );

  return {
    members,
    pendingInvites,
  };
}
