import { db } from "@/infra/db/client.ts";
import { activitiesTable } from "@/infra/db/tables/activities.table.ts";

type CreateActivityParams = {
  orgSlug: string;
  action: "CREATED_CHANNEL" | "CREATED_POST" | "CANCELED_POST" | "DELETED_POST" | "CREATED_PROJECT" | "ADDED_INTEGRATION" | "DELETED_INTEGRATION" | "UPLOAD_INSPIRATIONAL_THUMBNAIL" | "DELETED_INSPIRATIONAL_THUMBNAIL";
  authorId: string;
  description: string;
}

export async function createActivity(params: CreateActivityParams) {

  const { orgSlug, action, authorId, description } = params;

  await db.insert(activitiesTable).values({
    action,
    authorId,
    organizationSlug: orgSlug,
    description
  })
}
