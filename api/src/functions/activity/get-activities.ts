import { db } from "@/infra/db/client.ts";
import { activitiesTable } from "@/infra/db/tables/activities.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
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

  const result = await db
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

  const hasMore = result.length > PAGE_SIZE;
  const activities = hasMore ? result.slice(0, PAGE_SIZE) : result;
  const nextCursor = hasMore ? activities[activities.length - 1].id : null;

  return {
    activities,
    nextCursor,
  };
}
