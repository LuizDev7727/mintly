import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";

type GetChannelsParams = {
  orgSlug: string;
};

type GetChannelsResponse = {
  channels: {
    id: string;
    slug: string;
    name: string;
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
    })
    .from(channelsTable)
    .where(eq(channelsTable.organizationSlug, orgSlug));

  return { channels };
}
