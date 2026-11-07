import { db } from "@/infra/db/client.ts";
import { colorsTable } from "@/infra/db/tables/colors.table.ts";

type AddColorParams = {
  channelId: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
};

type AddColorResponse = {
  colorId: string;
};

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

export async function addColor(
  params: AddColorParams,
): Promise<AddColorResponse> {
  const { channelId, rgb } = params;

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;

  const [{ colorId }] = await db
    .insert(colorsTable)
    .values({ channelId, hex })
    .returning({ colorId: colorsTable.id });

  return { colorId };
}
