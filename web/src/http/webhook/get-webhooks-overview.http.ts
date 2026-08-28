import type { Webhook, WebhookLogStatus } from "@/types/webhook";
import { api } from "../api";

type GetWebhooksOverviewParams = {
  orgSlug: string;
};

type Metric = {
  value: number;
  trend: number;
  sparkline: number[];
};

export type RecentDelivery = {
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
  createdAt: string;
};

export type GetWebhooksOverviewResponse = {
  metrics: {
    totalDeliveries: Metric;
    successful: Metric;
    failed: Metric;
    pending: Metric;
    retryRate: Metric;
  };
  recentDeliveries: RecentDelivery[];
  webhooks: Webhook[];
  apiKey: string | null;
};

export async function getWebhooksOverviewHttp(
  params: GetWebhooksOverviewParams,
): Promise<GetWebhooksOverviewResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetWebhooksOverviewResponse>(
    `/organizations/${orgSlug}/webhooks/metrics`,
  );
  return data;
}
