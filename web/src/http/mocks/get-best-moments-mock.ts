import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetBestMomentsHttpResponse } from "../best-moments/get-best-moments.http";
import type { BestMoment } from "@/types/best-moment";

const PAGE_SIZE = 10;

const bestMoments: BestMoment[] = Array.from({ length: 34 }, () => ({
  id: faker.string.uuid(),
  title: faker.lorem.words({ min: 3, max: 6 }),
  url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  createdAt: faker.date.recent().toISOString(),
}));

export const getBestMomentsMock = http.get<
  { projectId: string },
  never,
  GetBestMomentsHttpResponse
>(
  "http://localhost:3000/api/projects/:projectId/best-moments",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");

    const startIndex = cursor
      ? bestMoments.findIndex((bestMoment) => bestMoment.id === cursor) + 1
      : 0;

    const page = bestMoments.slice(startIndex, startIndex + PAGE_SIZE);
    const hasMore = startIndex + PAGE_SIZE < bestMoments.length;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return HttpResponse.json({
      bestMoments: page,
      nextCursor,
    });
  },
);
