import type { Activity } from "@/types/activity";
import { api } from "../api";

type GetActivitiesHttpParams = {
  orgSlug: string;
  cursor?: string;
};

type GetActivitiesHttpResponse = {
  activities: Activity[];
  nextCursor: string | null;
};

export async function getActivitiesHttp(
  params: GetActivitiesHttpParams,
): Promise<GetActivitiesHttpResponse> {
  const { orgSlug, cursor } = params;

  const { data } = await api.get<GetActivitiesHttpResponse>(`/organizations/${orgSlug}/activities`, {
    params: cursor ? { cursor } : undefined,
  });

  const { activities, nextCursor } = data;

  return {
    activities,
    nextCursor
  };
}
