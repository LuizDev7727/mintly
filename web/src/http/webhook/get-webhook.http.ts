import type { WebhookLogStatus } from "@/types/webhook";
import { api } from "../api";

type GetWebhookParams = {
  orgSlug: string;
  webhookId: string;
};

export type WebhookLog = {
  id: string;
  url: string;
  status: WebhookLogStatus;
  method: string;
  pathname: string;
  ip: string;
  statusCode: number;
  contentType: string | null;
  contentLength: number | null;
  queryParams: Record<string, string> | null;
  headers: Record<string, string>;
  body: string | null;
  errorReason: string | null;
  numberOfRetries: number;
  createdAt: string;
  finishedAt: string | null;
};

export type GetWebhookResponse = {
  id: string;
  url: string;
  triggers: string[];
  signingSecret: string;
  createdAt: string;
  logs: WebhookLog[];
};

export async function getWebhookHttp(
  params: GetWebhookParams,
): Promise<GetWebhookResponse> {
  const { orgSlug, webhookId } = params;
  const { data } = await api.get<GetWebhookResponse>(
    `/organizations/${orgSlug}/webhooks/${webhookId}`,
  );
  return data;
}
