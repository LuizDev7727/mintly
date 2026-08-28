import { api } from "../api";

type GetAvailableEventsParams = {
  orgSlug: string;
};

export type AvailableEvent = {
  trigger: string;
  description: string;
};

export type GetAvailableEventsResponse = {
  triggers: AvailableEvent[];
};

export async function getAvailableEventsHttp(
  params: GetAvailableEventsParams,
): Promise<GetAvailableEventsResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetAvailableEventsResponse>(
    `/organizations/${orgSlug}/webhooks/available-events`,
  );
  return data;
}
