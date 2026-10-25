export class WebhookPublishError extends Error {
  constructor(failed: number, total: number, cause?: unknown) {
    super(`Failed to publish ${failed} of ${total} webhook event(s)`, { cause });
  }
}
