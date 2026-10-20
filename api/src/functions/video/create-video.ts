import { db } from "@/infra/db/client.ts";
import { videosTable } from "@/infra/db/tables/videos.table.ts";
import { generateVideoTask } from "@/infra/trigger/generate-video.task.ts";
import { tasks } from "@trigger.dev/sdk";
import { getChannel } from "../channel/get-channel.ts";

type CreateVideoParams = {
  organizationSlug: string;
  channelId: string;
  prompt: string;
  imageUrl: string;
};

type CreateVideoResponse = {
  videoId: string;
};

export async function createVideo(
  params: CreateVideoParams,
): Promise<CreateVideoResponse> {
  const { organizationSlug, channelId, prompt, imageUrl } = params;

  await getChannel({ channelId, organizationSlug });

  const [{ videoId }] = await db
    .insert(videosTable)
    .values({ channelId, status: "GENERATING" })
    .returning({ videoId: videosTable.id });

  await tasks.trigger<typeof generateVideoTask>("generate-video", {
    prompt,
    imageUrl,
  });

  return { videoId };
}
