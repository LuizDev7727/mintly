import { asc, eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { colorsTable } from "@/infra/db/tables/colors.table.ts";

type GetColorsParams = {
  channelId: string;
};

type GetColorsResponse = {
  colors: {
    id: string;
    hex: string;
    createdAt: Date;
  }[];
};

export async function getColors(params: GetColorsParams): Promise<GetColorsResponse> {
  const { channelId } = params;

  const colors = await db
    .select({
      id: colorsTable.id,
      hex: colorsTable.hex,
      createdAt: colorsTable.createdAt,
    })
    .from(colorsTable)
    .where(eq(colorsTable.channelId, channelId))
    .orderBy(asc(colorsTable.createdAt));

  return { colors };
}
