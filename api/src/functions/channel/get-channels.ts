import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { countDistinct, eq, sql } from "drizzle-orm";

type GetChannelsParams = {
  orgSlug: string;
};

type GetChannelsResponse = {
  channels: {
    id: string;
    slug: string;
    name: string;
    postsCount: number;
    postsSeries: number[];
    integrationsCount: number;
  }[];
};

export async function getChannels(
  params: GetChannelsParams,
): Promise<GetChannelsResponse> {
  const { orgSlug } = params;

  // Pre-aggregated per channel, so joining it below doesn't fan out the
  // posts/integrations counts (which would happen if array_agg ran directly
  // against the postsTable join).
  const postsSeriesPerChannel = db.$with("posts_series_per_channel").as(
    db
      .select({
        channelId: postsTable.channelId,
        postsSeries: sql<number[]>`array_agg(${postsTable.size} order by ${postsTable.createdAt})`.as(
          "posts_series",
        ),
      })
      .from(postsTable)
      .groupBy(postsTable.channelId),
  );

  const channels = await db
    .with(postsSeriesPerChannel)
    .select({
      id: channelsTable.id,
      slug: channelsTable.slug,
      name: channelsTable.name,
      postsCount: countDistinct(postsTable.id),
      integrationsCount: countDistinct(integrationsTable.id),
      postsSeries: sql<number[]>`coalesce(${postsSeriesPerChannel.postsSeries}, '{}')`,
    })
    .from(channelsTable)
    .leftJoin(postsTable, eq(postsTable.channelId, channelsTable.id))
    .leftJoin(integrationsTable, eq(integrationsTable.channelId, channelsTable.id))
    .leftJoin(
      postsSeriesPerChannel,
      eq(postsSeriesPerChannel.channelId, channelsTable.id),
    )
    .where(eq(channelsTable.organizationSlug, orgSlug))
    .groupBy(channelsTable.id, postsSeriesPerChannel.postsSeries);

  return { channels };
}
