import { logger, schemaTask, streams } from "@trigger.dev/sdk";
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

// Lê os blocos "key=value" que o ffmpeg escreve via `-progress pipe:3`
// (cada bloco termina numa linha `progress=continue` ou `progress=end`)
// e converte isso num percentual, usando `out_time_us` (microssegundos
// de vídeo já processados) contra a duração total conhecida do arquivo.
async function* readFfmpegProgress(
  stream: NodeJS.ReadableStream,
  durationInSeconds: number,
): AsyncGenerator<{ percent: number }> {
  let buffer = "";
  let block: Record<string, string> = {};

  for await (const chunk of stream) {
    buffer += chunk.toString();

    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf("\n");

      if (!line) continue;

      const [key, value] = line.split("=");
      block[key] = value;

      if (key === "progress") {
        const elapsedSeconds = Number(block.out_time_us ?? 0) / 1_000_000;
        const percent =
          durationInSeconds > 0
            ? Math.min(
                100,
                Math.max(0, (elapsedSeconds / durationInSeconds) * 100),
              )
            : 0;

        yield { percent: Math.round(percent) };
        block = {};
      }
    }
  }
}

// Projects não têm a duração do vídeo conhecida de antemão (diferente de
// posts, que já recebem isso do client no upload) — descobre rodando
// ffprobe direto na URL do vídeo, sem precisar baixar o arquivo inteiro.
function getVideoDurationInSeconds(videoUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const ffprobeCommand = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      videoUrl,
    ]);

    let output = "";
    ffprobeCommand.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobeCommand.stderr.on("data", (data) => {
      logger.debug("FFprobe:", data.toString());
    });

    ffprobeCommand.on("error", reject);
    ffprobeCommand.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`FFprobe exited with code ${code}`));
        return;
      }
      resolve(Number.parseFloat(output.trim()));
    });
  });
}

export const convertVideoToMp3Task = schemaTask({
  id: "convert-video-to-mp3",
  schema: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("post"),
      videoUrl: z.url(),
      postId: z.uuidv7(),
      basePathToSaveOnR2: z.string(),
      duration: z.number(),
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
        .set({ status: "ENCODING" })
        .where(eq(projectsTable.id, payload.projectId));
    }
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, _) => {
    const { videoUrl, basePathToSaveOnR2 } = payload;

    logger.log("Video Url: ", { videoUrl });

    logger.log("Path to save on R2: ", { basePathToSaveOnR2 });

    const durationInSeconds =
      payload.type === "post"
        ? payload.duration
        : await getVideoDurationInSeconds(videoUrl);

    const audioStream = new PassThrough();

    const ffmpegCommand = spawn(
      "ffmpeg",
      [
        "-i",
        videoUrl, // Input URL
        "-progress",
        "pipe:3", // Progresso estruturado (key=value) num fd dedicado
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
      ],
      { stdio: ["pipe", "pipe", "pipe", "pipe"] },
    );

    // Pipe do stdout do ffmpeg para o nosso stream
    ffmpegCommand.stdout.pipe(audioStream);

    // Log de erros do ffmpeg (stderr é onde ffmpeg envia logs)
    ffmpegCommand.stderr.on("data", (data) => {
      logger.debug("FFmpeg:", data.toString());
    });

    // Progresso de conversão em tempo real, pra post e project
    const progressStream = ffmpegCommand.stdio[3] as NodeJS.ReadableStream;

    streams.pipe(
      "encoding-progress",
      readFfmpegProgress(progressStream, durationInSeconds),
      { target: "parent" },
    );

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
        Key: `${audioId}.mp3`,
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
        Key: `${audioId}.mp3`,
      }),
      { expiresIn: 60 * 60 }, // 1 hour
    );

    logger.log("Upload completed successfully:", { audioUrl });

    return {
      audioUrl,
    };
  },
});
