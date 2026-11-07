import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { colorsTable } from "@/infra/db/tables/colors.table.ts";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type DeleteColorParams = {
  colorId: string;
};

export async function deleteColor(params: DeleteColorParams): Promise<void> {
  const { colorId } = params;

  const [deleted] = await db
    .delete(colorsTable)
    .where(eq(colorsTable.id, colorId))
    .returning({ id: colorsTable.id });

  if (!deleted) {
    throw new ResourceNotFoundError("Color not found");
  }
}
