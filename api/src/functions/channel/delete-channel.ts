import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../errors/resource-not-found.error.ts";

type DeleteChannelParams = {
  channelId: string;
};

export async function deleteChannel(
  params: DeleteChannelParams,
): Promise<void> {
  const { channelId } = params;

  const [deleted] = await db
    .delete(channelsTable)
    .where(eq(channelsTable.id, channelId))
    .returning({ id: channelsTable.id });

  if (!deleted) {
    throw new ResourceNotFoundError("Channel not found");
  }
}
