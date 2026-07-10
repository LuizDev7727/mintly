import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetPostsResponse } from "../posts/get-posts.http";
import type { Post } from "@/types/post";

const STATUSES: Post["status"][] = [
  "PROCESSING",
  "SCHEDULED",
  "ERROR",
  "PUBLISHED",
  "ENCODING",
  "GENERATING_METADATA",
  "GENERATING_THUMBNAIL",
  "TRANSCRIBING",
  "SEO_GENERATING",
  "PUBLISHING",
];

const SOCIALS = ["YOUTUBE", "TIKTOK"] as const;

const posts: Post[] = Array.from({ length: 48 }, () => ({
  id: faker.string.uuid(),
  thumbnailUrl: faker.datatype.boolean()
    ? faker.image.urlPicsumPhotos({ width: 1280, height: 720 })
    : null,
  title: faker.lorem.words({ min: 3, max: 8 }),
  size: faker.number.int({ min: 1_000_000, max: 500_000_000 }),
  type: faker.helpers.arrayElement(["video/mp4", "image/png", "image/jpeg"]),
  status: faker.helpers.arrayElement(STATUSES),
  duration: faker.number.int({ min: 0, max: 3600 }),
  publishAt: faker.datatype.boolean() ? faker.date.future() : null,
  socialsToPost: Array.from(
    { length: faker.number.int({ min: 1, max: 2 }) },
    () => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      social: faker.helpers.arrayElement(SOCIALS),
    }),
  ),
  author: {
    name: faker.person.fullName(),
    avatarUrl: null,
  },
}));

export const getPostsMock = http.get<
  { orgSlug: string; channelSlug: string },
  never,
  GetPostsResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/channels/:channelSlug/posts",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const folderId = searchParams.get("folderId") ?? "";
    const title = searchParams.get("title")?.toLowerCase() ?? "";
    const status = searchParams.get("status") ?? "";
    const limit = 10;

    let filtered = folderId ? posts.slice(0, 24) : posts;

    if (title) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(title));
    }

    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }

    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return HttpResponse.json({
      posts: paginated,
      meta: {
        totalCount: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  },
);
