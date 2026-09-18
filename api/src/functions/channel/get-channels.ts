import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";

type GetChannelsParams = {
  orgSlug: string;
};

type GetChannelsResponse = {
  channels: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
  }[];
};

export async function getChannels(
  params: GetChannelsParams,
): Promise<GetChannelsResponse> {
  const { orgSlug } = params;

  const channels = await db
    .select({
      id: channelsTable.id,
      name: channelsTable.name,
      description: channelsTable.description,
      createdAt: channelsTable.createdAt,
    })
    .from(channelsTable)
    .where(eq(channelsTable.organizationSlug, orgSlug));

  return { channels };
}
