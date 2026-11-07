import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";

type CompleteMultipartUploadParams = {
  key: string;
  uploadId: string;
  parts: { partNumber: number; eTag: string }[];
};

export async function completeMultipartUpload({
  key,
  uploadId,
  parts,
}: CompleteMultipartUploadParams): Promise<void> {
  await r2Client.send(
    new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .sort((a, b) => a.partNumber - b.partNumber)
          .map(({ partNumber, eTag }) => ({
            PartNumber: partNumber,
            ETag: eTag,
          })),
      },
    }),
  );
}
