import { db } from "@/infra/db/client.ts";
import { videosTable } from "@/infra/db/tables/videos.table.ts";
import { count, desc, eq } from "drizzle-orm";
import { getChannel } from "../channel/get-channel.ts";

type GetVideosParams = {
  organizationSlug: string;
  channelId: string;
  pageIndex: number;
};

type GetVideosResponse = {
  videos: {
    id: string;
    filename: string;
    status: "READY" | "GENERATING" | "FAILED";
    createdAt: Date;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 10;

export async function getVideos(
  params: GetVideosParams,
): Promise<GetVideosResponse> {
  const { organizationSlug, channelId, pageIndex } = params;

  await getChannel({ channelId, organizationSlug });

  const [videos, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: videosTable.id,
        filename: videosTable.filename,
        status: videosTable.status,
        createdAt: videosTable.createdAt,
      })
      .from(videosTable)
      .where(eq(videosTable.channelId, channelId))
      .orderBy(desc(videosTable.createdAt), desc(videosTable.id))
      .offset(pageIndex * PAGE_SIZE)
      .limit(PAGE_SIZE),
    db
      .select({ totalCount: count() })
      .from(videosTable)
      .where(eq(videosTable.channelId, channelId)),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return { videos, meta: { totalCount, totalPages } };
}
