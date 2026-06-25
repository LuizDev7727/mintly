import { db } from "@/infra/db/client";
import { channelsTable } from "@/infra/db/tables/channels.table";
import { eq } from "drizzle-orm";
import { ResourceNotFoundError } from "@/functions/errors/resource-not-found.error";

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
