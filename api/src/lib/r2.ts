import { S3Client } from "@aws-sdk/client-s3";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

export const BUCKET_NAME = await getInfisicalSecret({ secretName: "R2_BUCKET_NAME" });

export const r2Client = new S3Client({
  region: "auto",
  endpoint: await getInfisicalSecret({ secretName: "R2_ENDPOINT" }),
  credentials: {
    accessKeyId: await getInfisicalSecret({ secretName: "R2_ACCESS_KEY_ID" }),
    secretAccessKey: await getInfisicalSecret({ secretName: "R2_SECRET_ACCESS_KEY" }),
  },
});
