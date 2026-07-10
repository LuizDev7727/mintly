import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";

type UpdateChannelParams = {
  channelId: string;
  name: string;
};

export async function updateChannel(
  params: UpdateChannelParams,
): Promise<void> {
  const { channelId, name } = params;

  const [updated] = await db
    .update(channelsTable)
    .set({ name })
    .where(eq(channelsTable.id, channelId))
    .returning({ id: channelsTable.id });

  if (!updated) {
    throw new ResourceNotFoundError("Channel not found");
  }
}
