import { logger, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { getIntegrationForUpload } from "@/functions/integration/get-integration-for-upload.ts";

const InstagramMediaContainerSchema = z.object({
  id: z.string(),
});

const InstagramContainerStatusSchema = z.object({
  status_code: z.enum(["EXPIRED", "ERROR", "FINISHED", "IN_PROGRESS", "PUBLISHED"]),
});

const InstagramPublishSchema = z.object({
  id: z.string(),
});

const CONTAINER_POLL_INTERVAL_MS = 5_000;
const CONTAINER_MAX_POLL_ATTEMPTS = 36; // ~3 min, within the 5 min maxDuration

export const uploadPostToInstagramTask = schemaTask({
  id: "upload-post-to-instagram",
  machine: "small-2x",
  schema: z.object({
    fileUrl: z.url(),
    title: z.string(),
    postId: z.uuidv7(),
    fileSizeInBytes: z.number(),
    integrationId: z.string(),
    channelId: z.string(),
  }),

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, _) => {
    const { fileUrl, title } = payload;

    // The Instagram Business Account id is stored in `email` — connect-instagram.ts
    // repurposes that column for the IG user id instead of a real email address.
    const { accessToken, email: instagramUserId } = await getIntegrationForUpload({
      integrationId: payload.integrationId,
      channelId: payload.channelId,
      provider: "INSTAGRAM",
    });

    logger.log("Creating Instagram media container", { instagramUserId });

    const createContainerUrl = new URL(
      `https://graph.instagram.com/${instagramUserId}/media`,
    );
    createContainerUrl.searchParams.set("media_type", "REELS");
    createContainerUrl.searchParams.set("video_url", fileUrl);
    createContainerUrl.searchParams.set("caption", title);
    createContainerUrl.searchParams.set("access_token", accessToken);

    const createContainerResponse = await fetch(createContainerUrl, {
      method: "POST",
    });
    const createContainerJson = await createContainerResponse.json();

    if (!createContainerResponse.ok) {
      throw new Error(
        `Failed to create Instagram media container: ${JSON.stringify(createContainerJson)}`,
      );
    }

    const { id: containerId } = InstagramMediaContainerSchema.parse(
      createContainerJson,
    );

    logger.log("Instagram media container created", { containerId });

    let containerStatus: z.infer<
      typeof InstagramContainerStatusSchema
    >["status_code"] = "IN_PROGRESS";

    for (let attempt = 0; attempt < CONTAINER_MAX_POLL_ATTEMPTS; attempt++) {
      const statusUrl = new URL(`https://graph.instagram.com/${containerId}`);
      statusUrl.searchParams.set("fields", "status_code");
      statusUrl.searchParams.set("access_token", accessToken);

      const statusResponse = await fetch(statusUrl);
      const statusJson = await statusResponse.json();

      if (!statusResponse.ok) {
        throw new Error(
          `Failed to check Instagram container status: ${JSON.stringify(statusJson)}`,
        );
      }

      const { status_code } = InstagramContainerStatusSchema.parse(statusJson);
      containerStatus = status_code;

      logger.log("Instagram container status", { containerId, status_code });

      if (status_code === "FINISHED") {
        break;
      }

      if (status_code === "ERROR" || status_code === "EXPIRED") {
        throw new Error(
          `Instagram media container failed to process: ${status_code}`,
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, CONTAINER_POLL_INTERVAL_MS),
      );
    }

    if (containerStatus !== "FINISHED") {
      throw new Error(
        "Timed out waiting for Instagram media container to finish processing",
      );
    }

    const publishUrl = new URL(
      `https://graph.instagram.com/${instagramUserId}/media_publish`,
    );
    publishUrl.searchParams.set("creation_id", containerId);
    publishUrl.searchParams.set("access_token", accessToken);

    const publishResponse = await fetch(publishUrl, { method: "POST" });
    const publishJson = await publishResponse.json();

    if (!publishResponse.ok) {
      throw new Error(
        `Failed to publish Instagram media: ${JSON.stringify(publishJson)}`,
      );
    }

    const { id: mediaId } = InstagramPublishSchema.parse(publishJson);

    logger.log("Instagram media published", { mediaId });
  },
});
