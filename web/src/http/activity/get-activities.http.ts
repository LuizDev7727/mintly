import type { Activity } from "@/types/activity";
import { api } from "../api";

type GetActivitiesHttpParams = {
  orgSlug: string;
  cursor?: string;
  actionFilter: Activity["action"] | null;
  authorId: string | null;
};

type GetActivitiesHttpResponse = {
  activities: Activity[];
  nextCursor: string | null;
};

export async function getActivitiesHttp(
  params: GetActivitiesHttpParams,
): Promise<GetActivitiesHttpResponse> {
  const { orgSlug, cursor, actionFilter, authorId } = params;

  const { data } = await api.get<GetActivitiesHttpResponse>(`/organizations/${orgSlug}/activities`, {
    params: { cursor, actionFilter, authorId },
  });

  const { activities, nextCursor } = data;

  return {
    activities,
    nextCursor
  };
}
