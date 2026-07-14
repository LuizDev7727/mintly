import { env } from "@/env.ts";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { google } from "googleapis";
import { z } from "zod";
import os from "node:os";
import path from "node:path";
import { uuidv7 } from "uuidv7";
import { createReadStream, createWriteStream } from "node:fs";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { eq } from "drizzle-orm";
import { postsTable } from "@/infra/db/tables/posts.table.ts";

export const uploadPostToYoutubeTask = schemaTask({
  id: "upload-post-to-youtube",
  machine: "small-2x",
  schema: z.object({
    videoUrl: z.url(),
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    postId: z.uuidv7(),
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
    const { videoUrl, title, description, tags } = payload;

    logger.log("Video Url: ", { videoUrl });

    const video = await fetch(videoUrl);

    const tempVideoDirectory = os.tmpdir();
    const output_path = path.join(tempVideoDirectory, `video-${uuidv7()}.mp4`);

    if (!video.ok || !video.body) {
      throw new Error("Error at fetching video");
    }

    // Cria stream de escrita para arquivo temporário
    const fileStream = createWriteStream(output_path);

    // Lê o body do fetch como stream
    const reader = video.body.getReader();

    async function pump() {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fileStream.write(Buffer.from(value));
      }
    }

    await pump();
    fileStream.end();

    logger.log("Vídeo salvo em arquivo temporário:", { output_path });

    const tmpOauthClient = new google.auth.OAuth2({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: tmpOauthClient,
    });

    const [{ access_token, refresh_token, expiresIn }] = await db
      .select({
        access_token: integrationsTable.accessToken,
        refresh_token: integrationsTable.refresh_token,
        expiresIn: integrationsTable.expiry_in,
      })
      .from(integrationsTable)
      .where(eq(integrationsTable.provider, "YOUTUBE"));

    tmpOauthClient.setCredentials({
      access_token,
      refresh_token,
    });

    const isTokenExpired = Date.now() >= expiresIn;

    if (isTokenExpired) {
      const { credentials } = await tmpOauthClient.refreshAccessToken();
      tmpOauthClient.setCredentials({
        access_token: credentials.access_token,
        refresh_token,
        expiry_date: credentials.expiry_date,
      });
    }

    await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: createReadStream(output_path),
      },
      uploadType: "resumable",
    });
  },
});
