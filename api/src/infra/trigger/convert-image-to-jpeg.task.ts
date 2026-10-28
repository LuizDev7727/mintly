import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { logger, schemaTask } from "@trigger.dev/sdk";
import { spawn } from "node:child_process";
import { z } from "zod";

// Validade do link da imagem convertida. Cobre o upload para as redes.
const JPEG_URL_EXPIRES_IN_SECONDS = 60 * 60 * 2; // 2 hours

// A API do Instagram só aceita JPEG como imagem. Converte PNG e WebP com o
// ffmpeg (já presente no build do Trigger.dev) e guarda o resultado no R2.
export const convertImageToJpegTask = schemaTask({
  id: "convert-image-to-jpeg",
  schema: z.object({
    imageUrl: z.url(),
    postId: z.string(),
  }),
  maxDuration: 120,
  run: async (payload) => {
    const { imageUrl, postId } = payload;

    const chunks: Buffer[] = [];

    const ffmpegCommand = spawn("ffmpeg", [
      "-i",
      imageUrl,
      "-frames:v",
      "1",
      "-q:v",
      "2", // qualidade alta (escala do mjpeg: 2 a 31, menor é melhor)
      "-f",
      "image2",
      "-c:v",
      "mjpeg",
      "pipe:1", // saída no stdout
    ]);

    ffmpegCommand.stdout.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    ffmpegCommand.stderr.on("data", (data) => {
      logger.debug("FFmpeg:", data.toString());
    });

    await new Promise<void>((resolve, reject) => {
      ffmpegCommand.on("error", reject);
      ffmpegCommand.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg exited with code ${code}`));
        } else {
          resolve();
        }
      });
    });

    const jpegBuffer = Buffer.concat(chunks);

    if (jpegBuffer.length === 0) {
      throw new Error("FFmpeg produced an empty image");
    }

    const key = `converted-${postId}-${Date.now()}.jpg`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: jpegBuffer,
        ContentType: "image/jpeg",
      }),
    );

    logger.log("Image converted to JPEG", {
      key,
      size: `${(jpegBuffer.length / 1024).toFixed(2)} KB`,
    });

    return {
      jpegUrl: await generateSignedUrl({
        key,
        expiresIn: JPEG_URL_EXPIRES_IN_SECONDS,
      }),
    };
  },
});
