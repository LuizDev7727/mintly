import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { replicate } from "@/lib/replicate.ts";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { logger, schemaTask, wait } from "@trigger.dev/sdk";
import { spawn } from "node:child_process";
import { z } from "zod";
import type { Prediction } from "replicate";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";

export const generateThubmnailTask = schemaTask({
  id: "generate-thumbnail",
  machine: "small-2x",
  schema: z.object({
    videoUrl: z.url(),
    postId: z.string(),
    postDescription: z.string(),
  }),

  onStartAttempt: async ({ payload }) => {
    const { postId } = payload;
    await db
      .update(postsTable)
      .set({
        status: "GENERATING_THUMBNAIL",
      })
      .where(eq(postsTable.id, postId));
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
  run: async (payload) => {
    const { videoUrl, postId, postDescription } = payload;

    logger.log("Extraindo frame do vídeo", { videoUrl });

    // Coletar o output do FFmpeg em chunks
    const chunks: Buffer[] = [];

    const ffmpegCommand = spawn("ffmpeg", [
      "-i",
      videoUrl,
      "-ss",
      "5", // Seek to 5 seconds
      "-vframes",
      "1", // Extract 1 frame
      "-s",
      "1280x720", // Size
      "-f",
      "image2", // Force image format
      "-c:v",
      "mjpeg", // JPEG codec
      "pipe:1", // Output to stdout
    ]);

    // Coletar chunks do stdout
    ffmpegCommand.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    // Log de erros do ffmpeg
    ffmpegCommand.stderr.on("data", (data) => {
      logger.debug("FFmpeg:", data.toString());
    });

    // Aguardar o processo finalizar
    await new Promise<void>((resolve, reject) => {
      ffmpegCommand.on("error", (error) => {
        logger.error("FFmpeg process error:", { error });
        reject(error);
      });

      ffmpegCommand.on("close", (code) => {
        if (code !== 0) {
          logger.error(`FFmpeg exited with code ${code}`);
          reject(new Error(`FFmpeg exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    // Concatenar todos os chunks em um único buffer
    const frameBuffer = Buffer.concat(chunks);

    logger.log("Frame extraído com sucesso", {
      size: `${(frameBuffer.length / 1024).toFixed(2)} KB`,
    });

    // Upload do frame para Cloudflare R2
    const frameFilename = `frame-${postId}-${Date.now()}.jpg`;

    logger.log("Fazendo upload do frame para R2", { filename: frameFilename });

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: frameFilename,
        Body: frameBuffer,
        ContentType: "image/jpeg",
      }),
    );

    // Gerar URL assinada do frame no R2
    const frameSignedUrl = await generateSignedUrl({
      key: frameFilename,
    });

    logger.log("Frame enviado para R2 com sucesso", {
      frameUrl: frameSignedUrl,
    });

    // Preparar prompt para geração de thumbnail
    const prompt = `
      You are generating a high-performance YouTube thumbnail.

      PURPOSE & CONTEXT
      The goal of this image is to maximize clarity, click-through rate, and readability on mobile devices.
      The thumbnail must visually communicate the core idea of the video at a glance, without emotional exaggeration or visual clutter.

      VIDEO CONTEXT
      Description:

      """
      ${postDescription}
      """

      TEXT REQUIREMENTS (STRICT)
      - Include between 0 and 3 words only
      - Detect the language of the video description above and write the text in that exact same language
      - Use neutral, non-emotional language
      - Text must score between 1.2 and 1.9 on FKGL
      - Text must be large, bold, and instantly readable on mobile
      - High contrast between text and background

      VISUAL STYLE & COLOR PALETTE
      - Primary colors only: dark gray, gray, white, red, orange, blue
      - Clean, modern, bold design
      - High contrast lighting
      - No unnecessary elements or background noise
      - Minimalist composition focused on one clear idea

      SUBJECT & COMPOSITION (STEP-BY-STEP)
      1. Create a simple, uncluttered background using solid or softly graded tones from the approved color palette.
      2. Place the main subject in the foreground, occupying most of the frame.
      3. If applicable to the video context, include a human face:
      - Sharp focus
      - Neutral expression
      - Well-lit
      - Facing the camera or slightly angled for depth
      4. Add the text (if used) in a clear empty space, avoiding overlap with the face.
      5. Ensure strong visual hierarchy: face or main object first, text second.

      CAMERA & FRAMING
      - Medium close-up or close-up shot
      - Slightly low-angle or eye-level perspective
      - Shallow depth of field if a face is present
      - Framed for 16:9 YouTube thumbnail ratio
      - Optimized for mobile viewing

      SEMANTIC CONSTRAINTS (POSITIVE ONLY)
      - A clean scene with no visual clutter
      - A focused composition with no irrelevant objects
      - A professional, modern YouTube thumbnail aesthetic

      FINAL OUTPUT RULE
      Return ONLY the generated image / thumbnail.
      Do not include explanations, captions, or additional text.
    `.trim();

    // Preparar input para o Replicate
    const input = {
      prompt,
      resolution: "1K",
      image_input: [frameSignedUrl],
      aspect_ratio: "4:3",
      output_format: "png",
      safety_filter_level: "block_only_high",
    };

    logger.log("Gerando thumbnail com Replicate (google/nano-banana-pro)");

    // Criar token de waitpoint
    const token = await wait.createToken({
      timeout: "10m",
    });

    // Executar modelo do Replicate com webhook
    await replicate.run("google/nano-banana-pro", {
      input,
      webhook: token.url,
      webhook_events_filter: ["completed"],
    });

    logger.log("Aguardando conclusão do Replicate...");

    // Aguardar resultado do Replicate
    const result = await wait.forToken<Prediction>(token).unwrap();

    logger.log("Thumbnail gerada com sucesso pelo Replicate");
    logger.log("Result: ", { result });

    const thumbnailUrl = result.output;

    logger.log("Fazendo fetch da thumbnail gerada", { thumbnailUrl });

    const thumbnailResponse = await fetch(thumbnailUrl);

    if (!thumbnailResponse.ok || !thumbnailResponse.body) {
      throw new Error(
        `Failed to fetch thumbnail from Replicate: ${thumbnailResponse.statusText}`,
      );
    }

    const bodyStream = Readable.fromWeb(thumbnailResponse.body);

    const fileName = `nano-banana/${crypto.randomUUID()}.png`;

    logger.log("Fazendo upload da thumbnail para R2", { fileName });

    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: bodyStream,
        ContentType: "image/png",
      },
      leavePartsOnError: false,
    });

    await upload.done();

    // Atualizar o banco de dados com a URL da thumbnail
    await db
      .update(postsTable)
      .set({
        thumbnailStorageKey: `${fileName}`,
      })
      .where(eq(postsTable.id, postId));

    logger.log("Processo de geração de thumbnail concluído", {
      postId,
      thumbnailStorageKey: fileName,
    });
  },
});
