import { api } from "../api";

export type AvailableEvent = {
  trigger: string;
  description: string;
};

export type GetAvailableEventsResponse = {
  triggers: AvailableEvent[];
};

export async function getAvailableEventsHttp(): Promise<GetAvailableEventsResponse> {
  const { data } = await api.get<GetAvailableEventsResponse>(
    `/webhooks/available-events`,
  );
  return data;
}
