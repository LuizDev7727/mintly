import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { inspirationalThumbnailsTable } from "@/infra/db/tables/inspirational-thumbnail.table.ts";
import { BUCKET_NAME, r2Client } from "@/lib/r2.ts";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";

type DeleteInspirationalThumbnailParams = {
  inspirationalThumbnailId: string;
};

export async function deleteInspirationalThumbnail(
  params: DeleteInspirationalThumbnailParams,
): Promise<void> {
  const { inspirationalThumbnailId } = params;

  const [inspirationalThumbnail] = await db
    .select()
    .from(inspirationalThumbnailsTable)
    .where(eq(inspirationalThumbnailsTable.id, inspirationalThumbnailId));

  if (!inspirationalThumbnail) {
    throw new ResourceNotFoundError("Inspirational thumbnail not found");
  }

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: inspirationalThumbnail.key,
    }),
  );

  await db
    .delete(inspirationalThumbnailsTable)
    .where(eq(inspirationalThumbnailsTable.id, inspirationalThumbnailId));
}
