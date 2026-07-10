import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type GetChannelParams = {
  channelId: string;
};

type GetChannelResponse = {
  id: string;
  name: string;
};

export async function getChannel(
  params: GetChannelParams,
): Promise<GetChannelResponse> {
  const { channelId } = params;

  const [channel] = await db
    .select({
      id: channelsTable.id,
      name: channelsTable.name,
    })
    .from(channelsTable)
    .where(eq(channelsTable.id, channelId))
    .limit(1);

  if (!channel) {
    throw new ResourceNotFoundError("Channel not found");
  }

  return channel;
}
