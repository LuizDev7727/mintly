import { api } from "../api";

type CreateWebhookParams = {
  orgSlug: string;
  url: string;
  triggers: string[];
};

export type CreateWebhookResponse = {
  id: string;
  signingKey: string;
};

export async function createWebhookHttp(
  params: CreateWebhookParams,
): Promise<CreateWebhookResponse> {
  const { orgSlug, url, triggers } = params;
  const { data } = await api.post<CreateWebhookResponse>(
    `/organizations/${orgSlug}/webhooks`,
    { url, triggers },
  );
  return data;
}
