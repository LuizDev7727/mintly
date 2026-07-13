import { db } from "@/infra/db/client.ts";
import { inspirationalThumbnailsTable } from "@/infra/db/tables/inspirational-thumbnail.table.ts";

type AddInspirationalThumbnailParams = {
  channelId: string;
  name: string;
  type: string;
  size: number;
  key: string;
};

type AddInspirationalThumbnailResponse = {
  inspirationalThumbnailId: string;
};

export async function addInspirationalThumbnail(
  params: AddInspirationalThumbnailParams,
): Promise<AddInspirationalThumbnailResponse> {
  const { channelId, name, type, size, key } = params;

  const [result] = await db
    .insert(inspirationalThumbnailsTable)
    .values({
      name,
      channelId,
      key,
      sizeInMs: size,
      type,
    })
    .returning({ id: inspirationalThumbnailsTable.id });

  return {
    inspirationalThumbnailId: result.id,
  };
}
