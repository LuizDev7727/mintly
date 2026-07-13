import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";

type GenerateSignedUrlParams = {
  key: string;
  expiresIn?: number;
};

export async function generateSignedUrl({
  key,
  expiresIn = 60 * 60, // 1 hora por padrão
}: GenerateSignedUrlParams): Promise<string> {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }),
    { expiresIn },
  );
}
