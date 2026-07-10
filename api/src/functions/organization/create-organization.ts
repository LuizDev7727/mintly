import { OrganizationAlreadyCreatedError } from "@/errors/organization-already-created.ts";
import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { eq } from "drizzle-orm";

type CreateOrganizationParams = {
  userId: string;
  name: string;
  slug: string;
};

export async function createOrganization(params: CreateOrganizationParams) {
  const { userId, name, slug } = params;

  const [organization] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, slug));

  if (organization) {
    throw new OrganizationAlreadyCreatedError();
  }

  const [newOrganization] = await db
    .insert(organizationsTable)
    .values({ ownerId: userId, name, slug })
    .returning({ id: organizationsTable.id });

  await db.insert(membersTable).values({
    organizationSlug: slug,
    userId,
    role: "owner",
    createdAt: new Date(),
  });

  return {
    organizationId: newOrganization.id,
  };
}
