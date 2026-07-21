import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { eq } from "drizzle-orm";

type UpdateOrganizationProps = {
  slug: string;
  name: string;
  avatarKey: string | null;
};

export async function updateOrganization({
  slug,
  name,
  avatarKey,
}: UpdateOrganizationProps) {
  const [currentOrganization] = await db
    .select({ name: organizationsTable.name, logo: organizationsTable.logo })
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, slug));

  if (!currentOrganization) {
    throw new ResourceNotFoundError(`Organization with slug ${slug} not found`);
  }

  const hasAvatarChanged = avatarKey !== currentOrganization.logo;

  if (avatarKey && hasAvatarChanged) {
    // checks if the avatar is uploaded on R2 by key
    await checkFileExists({ key: avatarKey })
  }

  await db
    .update(organizationsTable)
    .set({
      name: name,
      logo: avatarKey,
    })
    .where(
      eq(organizationsTable.slug, slug),
    )
}
