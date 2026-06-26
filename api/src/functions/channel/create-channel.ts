import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";

type CreateChannelParams = {
  orgSlug: string;
  name: string;
};

type CreateChannelResponse = {
  channelId: string;
};

export async function createChannel(
  params: CreateChannelParams,
): Promise<CreateChannelResponse> {
  const { orgSlug, name } = params;

  const [{ channelId }] = await db
    .insert(channelsTable)
    .values({ name, organizationSlug: orgSlug })
    .returning({ channelId: channelsTable.id });

  return { channelId };
}
