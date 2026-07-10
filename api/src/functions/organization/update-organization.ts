import { OrganizationAlreadyCreatedError } from "@/errors/organization-already-created.ts";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { createSlug } from "@/lib/create-slug.ts";
import { eq } from "drizzle-orm";

type UpdateOrganizationProps = {
  slug: string;
  newName: string;
};

export async function updateOrganization({
  slug,
  newName,
}: UpdateOrganizationProps) {
  const [currentOrganization] = await db
    .select({ slug: organizationsTable.slug })
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, slug));

  if (!currentOrganization) {
    throw new ResourceNotFoundError(`Organization with slug ${slug} not found`);
  }

  const newSlugToTake = createSlug(newName);

  const [organizationWithSameSlug] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, newSlugToTake));

  if (organizationWithSameSlug) {
    throw new OrganizationAlreadyCreatedError();
  }

  await db.transaction(async (tx) => {
    await tx
      .update(organizationsTable)
      .set({ name: newName, slug: newSlugToTake })
      .where(eq(organizationsTable.slug, slug));

    await tx
      .update(channelsTable)
      .set({ organizationSlug: newSlugToTake })
      .where(eq(channelsTable.organizationSlug, slug));
    await tx
      .update(membersTable)
      .set({ organizationSlug: newSlugToTake })
      .where(eq(membersTable.organizationSlug, slug));
  });
}
