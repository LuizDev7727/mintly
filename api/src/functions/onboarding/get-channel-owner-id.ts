import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { eq } from "drizzle-orm";

type GetChannelOwnerIdParams = {
  channelId: string;
};

type GetChannelOwnerIdResponse = {
  ownerId: string | null;
};

export async function getChannelOwnerId(
  params: GetChannelOwnerIdParams,
): Promise<GetChannelOwnerIdResponse> {
  const { channelId } = params;

  const [row] = await db
    .select({ ownerId: organizationsTable.ownerId })
    .from(channelsTable)
    .innerJoin(
      organizationsTable,
      eq(channelsTable.organizationSlug, organizationsTable.slug),
    )
    .where(eq(channelsTable.id, channelId));

  return { ownerId: row?.ownerId ?? null };
}
