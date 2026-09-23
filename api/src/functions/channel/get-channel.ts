import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { and, eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type GetChannelParams = {
  channelId: string;
  // Required on purpose: a channel id alone is not enough to authorize access,
  // it must belong to the caller's organization.
  organizationSlug: string;
};

type GetChannelResponse = {
  id: string;
  name: string;
};

export async function getChannel(
  params: GetChannelParams,
): Promise<GetChannelResponse> {
  const { channelId, organizationSlug } = params;

  const [channel] = await db
    .select({
      id: channelsTable.id,
      name: channelsTable.name,
    })
    .from(channelsTable)
    .where(
      and(
        eq(channelsTable.id, channelId),
        eq(channelsTable.organizationSlug, organizationSlug),
      ),
    )
    .limit(1);

  // A channel of another organization is reported exactly like a missing one,
  // so the response does not reveal that the id exists.
  if (!channel) {
    throw new ResourceNotFoundError("Channel not found");
  }

  return channel;
}
