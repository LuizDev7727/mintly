import { logger, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { uuidv7 } from "uuidv7";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
// import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { db } from "@/infra/db/client.ts";
import { eq } from "drizzle-orm";
import { projectsTable } from "../db/tables/projects.table.ts";

export const convertVideoToMp3Task = schemaTask({
  id: "convert-video-to-mp3",
  schema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("post"),
      videoUrl: z.url(),
      postId: z.uuidv7(),
      basePathToSaveOnR2: z.string(),
    }),
    z.object({
      type: z.literal("project"),
      videoUrl: z.url(),
      projectId: z.uuidv7(),
      basePathToSaveOnR2: z.string(),
    }),
  ]),
  onStart: async ({ payload }) => {
    if (payload.type === "post") {
      await db
        .update(postsTable)
        .set({ status: "ENCODING" })
        .where(eq(postsTable.id, payload.postId));
    } else {
      await db
        .update(projectsTable)
        .set({ status: "PROCESSING" })
        .where(eq(projectsTable.id, payload.projectId));
    }
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async ({ videoUrl, basePathToSaveOnR2 }, _) => {
    logger.log("Video Url: ", { videoUrl });

    logger.log("Path to save on R2: ", { basePathToSaveOnR2 });

    const audioStream = new PassThrough();

    const ffmpegCommand = spawn("ffmpeg", [
      "-i",
      videoUrl, // Input URL
      "-vn", // Remove vídeo
      "-acodec",
      "libmp3lame", // Áudio MP3
      "-ar",
      "44100", // Sample rate
      "-ac",
      "2", // Stereo
      "-f",
      "mp3", // Formato MP3
      "pipe:1", // Output via stdout
    ]);

    // Pipe do stdout do ffmpeg para o nosso stream
    ffmpegCommand.stdout.pipe(audioStream);

    // Log de erros do ffmpeg (stderr é onde ffmpeg envia logs)
    ffmpegCommand.stderr.on("data", (data) => {
      logger.debug("FFmpeg:", data.toString());
    });

    // Tratamento de erros do ffmpeg
    const ffmpegDone = new Promise<void>((resolve, reject) => {
      ffmpegCommand.on("error", (error) => {
        logger.error("FFmpeg process error:", { error });
        audioStream.destroy(error);
        reject(error);
      });
      ffmpegCommand.on("close", (code) => {
        if (code !== 0) {
          const error = new Error(`FFmpeg exited with code ${code}`);
          logger.error(error.message);
          audioStream.destroy(error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    // Upload paralelo para R2 usando streaming
    const audioId = uuidv7();

    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: `${basePathToSaveOnR2}/${audioId}.mp3`,
        Body: audioStream,
        ContentType: "audio/mpeg",
      },
      // Configurações de performance
      queueSize: 4,
      partSize: 5 * 1024 * 1024, // 5MB por parte
      leavePartsOnError: false,
    });

    await Promise.all([upload.done(), ffmpegDone]);

    const audioUrl = await getSignedUrl(
      r2Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${basePathToSaveOnR2}/${audioId}.mp3`,
      }),
      { expiresIn: 60 * 60 }, // 1 hour
    );

    logger.log("Upload completed successfully:", { audioUrl });

    return {
      audioUrl,
    };
  },
});
