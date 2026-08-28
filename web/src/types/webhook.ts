export type WebhookLogStatus = "PENDING" | "SUCCESS" | "FAILED";

export type Webhook = {
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
