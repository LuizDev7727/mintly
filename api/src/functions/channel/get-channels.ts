import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { countDistinct , eq } from "drizzle-orm";

type GetChannelsParams = {
  orgSlug: string;
};

type GetChannelsResponse = {
  channels: {
    id: string;
    slug: string;
    name: string;
    postsCount: number;
    integrationsCount: number;
  }[];
};

export async function getChannels(
  params: GetChannelsParams,
): Promise<GetChannelsResponse> {
  const { orgSlug } = params;

  const channels = await db
    .select({
      id: channelsTable.id,
      slug: channelsTable.slug,
      name: channelsTable.name,
      postsCount: countDistinct(postsTable.id),
      integrationsCount: countDistinct(integrationsTable.id),
    })
    .from(channelsTable)
    .leftJoin(postsTable, eq(postsTable.channelId, channelsTable.id))
    .leftJoin(integrationsTable, eq(integrationsTable.channelId, channelsTable.id))
    .where(eq(channelsTable.organizationSlug, orgSlug))
    .groupBy(channelsTable.id);

  return { channels };
}
