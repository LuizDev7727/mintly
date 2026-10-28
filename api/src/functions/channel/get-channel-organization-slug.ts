import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";

type GetChannelOrganizationSlugParams = {
  channelId: string;
};

// Para quem só tem o canal (as tasks do Trigger.dev) e precisa da organização.
export async function getChannelOrganizationSlug(
  params: GetChannelOrganizationSlugParams,
): Promise<string> {
  const { channelId } = params;

  const [channel] = await db
    .select({ organizationSlug: channelsTable.organizationSlug })
    .from(channelsTable)
    .where(eq(channelsTable.id, channelId))
    .limit(1);

  if (!channel) {
    throw new ResourceNotFoundError("Channel not found");
  }

  return channel.organizationSlug;
}
