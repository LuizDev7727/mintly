import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { ListPartsCommand } from "@aws-sdk/client-s3";

type ListMultipartUploadPartsParams = {
  key: string;
  uploadId: string;
};

type ListMultipartUploadPartsResponse = {
  parts: { partNumber: number; eTag: string; size: number }[];
};

export async function listMultipartUploadParts({
  key,
  uploadId,
}: ListMultipartUploadPartsParams): Promise<ListMultipartUploadPartsResponse> {
  const parts: { partNumber: number; eTag: string; size: number }[] = [];

  let partNumberMarker: string | undefined;
  let isTruncated = true;

  while (isTruncated) {
    const response = await r2Client.send(
      new ListPartsCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        PartNumberMarker: partNumberMarker,
      }),
    );

    for (const part of response.Parts ?? []) {
      if (
        part.PartNumber !== undefined &&
        part.ETag !== undefined &&
        part.Size !== undefined
      ) {
        parts.push({
          partNumber: part.PartNumber,
          eTag: part.ETag,
          size: part.Size,
        });
      }
    }

    isTruncated = response.IsTruncated ?? false;
    partNumberMarker = response.NextPartNumberMarker;
  }

  return { parts };
}
