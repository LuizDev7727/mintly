import { UserNotBelongsToTheOrganizationError } from "@/errors/user-not-belongs-to-the-organization.ts";
import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { and, eq } from "drizzle-orm";

type CheckMembershipParams = {
  organizationSlug: string;
  userId: string;
};

export async function checkMembership({
  organizationSlug,
  userId,
}: CheckMembershipParams) {
  const [membership] = await db
    .select({ id: membersTable.id })
    .from(membersTable)
    .where(
      and(
        eq(membersTable.organizationSlug, organizationSlug),
        eq(membersTable.userId, userId),
      ),
    );

  if (!membership) {
    throw new UserNotBelongsToTheOrganizationError();
  }
}
