import { db } from "@/infra/db/client.ts";
import { activitiesTable } from "@/infra/db/tables/activities.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, desc, eq, lt } from "drizzle-orm";

type GetActivitiesParams = {
  orgSlug: string;
  cursor?: string;
};

type Activity = {
  id: string;
  action:
    | "CREATED_CHANNEL"
    | "CREATED_POST"
    | "CANCELED_POST"
    | "DELETED_POST"
    | "CREATED_PROJECT"
    | "ADDED_INTEGRATION"
    | "DELETED_INTEGRATION"
    | "UPLOAD_INSPIRATIONAL_THUMBNAIL"
    | "DELETED_INSPIRATIONAL_THUMBNAIL";
  description: string;
  createdAt: Date;
  author: {
    name: string;
    avatarUrl: string | null;
  };
};

type GetActivitiesResponse = {
  activities: Activity[];
  nextCursor: string | null;
};

const PAGE_SIZE = 10;

export async function getActivities(
  params: GetActivitiesParams,
): Promise<GetActivitiesResponse> {
  const { orgSlug, cursor } = params;

  const resultQuery = await db
    .select({
      id: activitiesTable.id,
      action: activitiesTable.action,
      description: activitiesTable.description,
      createdAt: activitiesTable.createdAt,
      author: {
        name: usersTable.name,
        avatarUrl: usersTable.image,
      },
    })
    .from(activitiesTable)
    .innerJoin(usersTable, eq(activitiesTable.authorId, usersTable.id))
    .where(
      and(
        eq(activitiesTable.organizationSlug, orgSlug),
        cursor ? lt(activitiesTable.id, cursor) : undefined,
      ),
    )
    .orderBy(desc(activitiesTable.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = resultQuery.length > PAGE_SIZE;
  const result = hasMore ? resultQuery.slice(0, PAGE_SIZE) : resultQuery;
  const nextCursor = hasMore ? result[result.length - 1].id : null;

  const activities = await Promise.all(
    result.map(async (activity) => ({
      ...activity,
      author: {
        name: activity.author.name,
        avatarUrl: activity.author.avatarUrl ? await generateSignedUrl({ key: activity.author.avatarUrl }) : null,
      },
    })),
  );

  return {
    activities,
    nextCursor,
  };
}
