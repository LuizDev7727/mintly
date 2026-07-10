import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";
import { count, eq } from "drizzle-orm";

type GetOrganizationParams = {
  organizationSlug: string;
};

export async function getOrganization({
  organizationSlug,
}: GetOrganizationParams) {
  const [organization] = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      slug: organizationsTable.slug,
      logo: organizationsTable.logo,
      billingEmail: organizationsTable.billingEmail,
      membersCount: count(membersTable.id),
    })
    .from(organizationsTable)
    .leftJoin(
      membersTable,
      eq(membersTable.organizationSlug, organizationsTable.slug),
    )
    .where(eq(organizationsTable.slug, organizationSlug))
    .groupBy(organizationsTable.id);

  if (!organization) {
    throw new ResourceNotFoundError(
      `Organization with slug ${organizationSlug} not found`,
    );
  }

  return {
    organization,
  };
}
