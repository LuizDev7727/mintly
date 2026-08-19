import { api } from "../api";

type GetWebhooksOverviewParams = {
  orgSlug: string;
};

type Metric = {
  value: number;
  trend: number;
  sparkline: number[];
};

export type WebhookLogStatus = "PENDING" | "SUCCESS" | "FAILED";

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

export type WebhookSummary = {
  id: string;
  url: string;
  triggers: string[];
  signingSecret: string;
  createdAt: string;
  lastLog: {
    status: WebhookLogStatus;
    createdAt: string;
  } | null;
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
  webhooks: WebhookSummary[];
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
