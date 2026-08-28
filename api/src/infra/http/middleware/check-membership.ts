import { UserNotBelongsToTheOrganizationError } from "@/errors/user-not-belongs-to-the-organization.ts";
import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { and, eq } from "drizzle-orm";

type CheckMembershipProps = {
  organizationSlug: string;
  userId: string
}

export async function checkMembership(props: CheckMembershipProps) {

  const { organizationSlug, userId } = props;

  const [membership] = await db
    .select({
      id: membersTable.id,
      role: membersTable.role,
    })
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
