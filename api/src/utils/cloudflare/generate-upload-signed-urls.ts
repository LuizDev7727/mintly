import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import {
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { uuidv7 } from "uuidv7";

// 10 MB per part
const PART_SIZE = 10 * 1024 * 1024;

// 100 MB
const MULTIPART_THRESHOLD = 100 * 1024 * 1024;

type GenerateUploadSignedUrlsParams = {
  expiresIn?: number;
  file: {
    name: string;
    type: string;
    size: number;
  };
  resume?: {
    key: string;
    uploadId: string;
    partNumbers: number[];
  };
};

type GenerateUploadSignedUrlsResponse = {
  key: string;
  uploadId: string | null;
  parts: { partNumber: number; url: string }[];
}

export async function generateUploadSignedUrls({
  expiresIn,
  file,
  resume,
}: GenerateUploadSignedUrlsParams): Promise<GenerateUploadSignedUrlsResponse> {


  if (resume) {
    const { key, uploadId, partNumbers } = resume;

    const parts = await Promise.all(
      partNumbers.map(async (partNumber) => {
        const url = await getSignedUrl(
          r2Client,
          new UploadPartCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            UploadId: uploadId,
            PartNumber: partNumber,
          }),
          { expiresIn: expiresIn ?? 3600 },
        );

        return { partNumber, url };
      }),
    );

    return { key, uploadId, parts };
  }

  const key = `${uuidv7()}`;

  const exceedsMultipartThreshold = file.size > MULTIPART_THRESHOLD;

  if (!exceedsMultipartThreshold) {
    const url = await getSignedUrl(
      r2Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: file.type,
        ContentLength: file.size,
      }),
      { expiresIn: expiresIn ?? 3600 }, // Valid for 1 hour
    );

    return { key, uploadId: null, parts: [{ partNumber: 1, url }] };
  }

  const { UploadId } = await r2Client.send(
    new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: file.type,
    }),
  );

  if (!UploadId) {
    throw new Error("Failed to start multipart upload");
  }

  const partCount = Math.ceil(file.size / PART_SIZE);

  const parts = await Promise.all(
    Array.from({ length: partCount }, (_, index) => index + 1).map(
      async (partNumber) => {
        const url = await getSignedUrl(
          r2Client,
          new UploadPartCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            UploadId,
            PartNumber: partNumber,
          }),
          { expiresIn: expiresIn ?? 3600 },
        );

        return { partNumber, url };
      },
    ),
  );

  return { key, uploadId: UploadId, parts };
}
