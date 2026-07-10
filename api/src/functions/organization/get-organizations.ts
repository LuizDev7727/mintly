import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { count, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

type GetOrganizationsProps = {
  userId: string;
};

export async function getOrganizations({ userId }: GetOrganizationsProps) {
  const orgMembers = alias(membersTable, "org_members");

  const organizations = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      slug: organizationsTable.slug,
      membersCount: count(orgMembers.id),
    })
    .from(organizationsTable)
    .innerJoin(
      membersTable,
      eq(membersTable.organizationSlug, organizationsTable.slug),
    )
    .leftJoin(
      orgMembers,
      eq(orgMembers.organizationSlug, organizationsTable.slug),
    )
    .where(eq(membersTable.userId, userId))
    .groupBy(organizationsTable.id);

  return {
    organizations,
  };
}
