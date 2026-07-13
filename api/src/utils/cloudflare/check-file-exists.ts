import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

type CheckFileExistsParams = {
  key: string;
};

export async function checkFileExists({
  key,
}: CheckFileExistsParams): Promise<void> {
  try {
    await r2Client.send(
      new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }),
    );
  } catch (error) {
    if (error instanceof Error && error.name === "NotFound") {
      throw new ResourceNotFoundError(`File not found: ${key}`);
    }

    throw error;
  }
}
