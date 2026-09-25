import { logger, schemaTask, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import os from "node:os";
import path from "node:path";
import { uuidv7 } from "uuidv7";
import { createReadStream, createWriteStream } from "node:fs";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

export const uploadPostToTiktokTask = schemaTask({
  id: "upload-post-to-tiktok",
  machine: "small-2x",
  schema: z.object({
    fileUrl: z.url(),
    title: z.string(),
    postId: z.uuidv7(),
    channelId: z.string(),
    fileSizeInBytes: z.number(),
  }),

  onStart: async ({ payload }) => {
    await db
      .update(postsTable)
      .set({
        status: "PUBLISHING",
      })
      .where(eq(postsTable.id, payload.postId));
  },

  onSuccess: async ({ payload }) => {
    await db
      .update(postsTable)
      .set({
        status: "PUBLISHED",
      })
      .where(eq(postsTable.id, payload.postId));
  },

  onFailure: async ({ payload }) => {
    const { postId } = payload;
    await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, postId));
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, _) => {

    const MAX_CHUNK_SIZE = 1024 * 1024 * 64; // 64MB

    const { fileUrl, title, fileSizeInBytes, channelId } = payload;

    const file = await fetch(fileUrl);

    const tempVideoDirectory = os.tmpdir();
    const file_output_path = path.join(tempVideoDirectory, `file-${uuidv7()}.mp4`);

    if (!file.ok || !file.body) {
      throw new Error("Error at fetching file");
    }

    // Cria stream de escrita para arquivo temporário
    const fileStream = createWriteStream(file_output_path);

    // Lê o body do fetch como stream
    const reader = file.body.getReader();

    async function pump() {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fileStream.write(Buffer.from(value));
      }
    }

    await pump();
    fileStream.end();

    logger.log("Arquivo salvo em arquivo temporário:", { file_output_path });

    const hasMoreThanOneChunk = fileSizeInBytes > MAX_CHUNK_SIZE;
    const videoSize = fileSizeInBytes;
    const totalChunkCount = hasMoreThanOneChunk ? Math.ceil(videoSize / MAX_CHUNK_SIZE) : 1;

    const chunkSize = hasMoreThanOneChunk ? MAX_CHUNK_SIZE : videoSize;

    const [integration] = await db
      .select()
      .from(integrationsTable)
      .where(
        and(
          eq(integrationsTable.provider, "TIKTOK"),
          eq(integrationsTable.channelId, channelId),
        ),
      );

    if (!integration) {
      throw new Error("TikTok integration not found for this channel.");
    }

    const {
      id: integrationId,
      accessToken,
      refresh_token,
      expiry_in,
    } = integration;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const isAccessTokenValid = nowInSeconds < expiry_in;

    let tiktokAccessToken = accessToken;

    if (!isAccessTokenValid) {
      const tiktokRefreshRequestUrl = new URL(
        "/v2/oauth/token/",
        "https://open.tiktokapis.com",
      );
      const tiktokRefreshRequest = await fetch(tiktokRefreshRequestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: await getInfisicalSecret({ secretName: "TIKTOK_CLIENT_KEY" }),
          client_secret: await getInfisicalSecret({ secretName: "TIKTOK_CLIENT_SECRET" }),
          refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (!tiktokRefreshRequest.ok) {
        throw new Error(
          "TikTok refresh token expired. User must reconnect their TikTok account.",
        );
      }

      const {
        access_token: newAccessToken,
        expires_in: newExpiresIn,
        refresh_token: newRefreshToken,
        refresh_expires_in: newRefreshExpiresIn,
      } = z
        .object({
          access_token: z.string(),
          expires_in: z.number(),
          refresh_token: z.string(),
          refresh_expires_in: z.number(),
        })
        .parse(await tiktokRefreshRequest.json());

      await db
        .update(integrationsTable)
        .set({
          accessToken: newAccessToken,
          expiry_in: nowInSeconds + newExpiresIn,
          refresh_token: newRefreshToken,
          refreshExpiresIn: nowInSeconds + newRefreshExpiresIn,
        })
        .where(eq(integrationsTable.id, integrationId));

      tiktokAccessToken = newAccessToken;
    }

    const tiktokUploadRequestUrl = new URL(
      "/v2/post/publish/video/init/",
      "https://open.tiktokapis.com",
    );

    const tiktokUploadVideoResponse = await fetch(
      tiktokUploadRequestUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tiktokAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: title,
            privacy_level: "PUBLIC_TO_EVERYONE",
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "FILE_UPLOAD",
            video_size: videoSize,
            chunk_size: chunkSize,
            total_chunk_count: totalChunkCount
          },
        }),
      },
    );

    const tiktokUploadVideoJson = await tiktokUploadVideoResponse.json();

    logger.log("tiktokUploadVideoJson: ", { tiktokUploadVideoJson });

    // On failure TikTok answers with `data: {}` and an `error.code` other than
    // "ok", so every `data` field is optional and `error` is checked below.
    const tiktokUploadVideoResponseSchema = z.object({
      data: z
        .object({
          publish_id: z.string().optional(),
          upload_url: z.string().optional(),
        })
        .optional(),
      error: z.object({
        code: z.string(),
        message: z.string(),
        log_id: z.string().optional(),
      }),
    });

    const { data, error } = tiktokUploadVideoResponseSchema.parse(tiktokUploadVideoJson);

    logger.log("tiktokUploadVideoResponse: ", { data, error });

    if (error.code !== "ok" || !data?.publish_id || !data.upload_url) {
      throw new Error(
        `TikTok rejected the video upload (${error.code}): ${error.message} [log_id: ${error.log_id}]`,
      );
    }

    const { publish_id, upload_url: uploadUrl } = data;

    for (let i = 0; i < totalChunkCount; i++) {

      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, videoSize) - 1;
      const length = end - start + 1;

      const chunkStream = createReadStream(file_output_path, { start, end });

      const chunkResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(length),
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        },
        body: chunkStream,
        duplex: "half"
      });

      if (!chunkResponse.ok) {
        throw new Error(
          `TikTok chunk upload failed (HTTP ${chunkResponse.status}) at chunk ${i + 1}/${totalChunkCount}`,
        );
      }
    }

    const MAX_PUBLISH_STATUS_CHECKS = 24;
    const PUBLISH_STATUS_CHECK_INTERVAL_IN_SECONDS = 5;

    const publishStatusResponseSchema = z.object({
      data: z
        .object({
          status: z.string().optional(),
          fail_reason: z.string().optional(),
        })
        .optional(),
      error: z.object({
        code: z.string(),
        message: z.string(),
      }),
    });

    // Finishing the upload does not mean the video was published: TikTok
    // processes it afterwards. Only PUBLISH_COMPLETE counts as success.
    for (let attempt = 1; attempt <= MAX_PUBLISH_STATUS_CHECKS; attempt++) {
      const checkPublishStatusResponse = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tiktokAccessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          publish_id,
        }),
      });

      const { data: publishStatus, error: publishStatusError } =
        publishStatusResponseSchema.parse(await checkPublishStatusResponse.json());

      logger.log("Check publish status: ", { attempt, publishStatus, publishStatusError });

      if (publishStatusError.code !== "ok" || !publishStatus?.status) {
        throw new Error(
          `TikTok publish status check failed (${publishStatusError.code}): ${publishStatusError.message}`,
        );
      }

      if (publishStatus.status === "PUBLISH_COMPLETE") {
        return;
      }

      if (publishStatus.status === "FAILED") {
        throw new Error(
          `TikTok failed to publish the video: ${publishStatus.fail_reason ?? "unknown reason"}`,
        );
      }

      await wait.for({ seconds: PUBLISH_STATUS_CHECK_INTERVAL_IN_SECONDS });
    }

    throw new Error("TikTok did not finish publishing the video in time.");
  },
});
