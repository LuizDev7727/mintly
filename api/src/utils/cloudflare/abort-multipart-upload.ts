import { AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";

type AbortMultipartUploadParams = {
  key: string;
  uploadId: string;
};

export async function abortMultipartUpload({
  key,
  uploadId,
}: AbortMultipartUploadParams): Promise<void> {
  await r2Client.send(
    new AbortMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    }),
  );
}
