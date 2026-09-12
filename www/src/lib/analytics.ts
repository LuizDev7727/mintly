import { cookies } from "next/headers";
import { posthogClient } from "./posthog";

const DISTINCT_ID_COOKIE = "posthog_distinct_id";
const CONSENT_COOKIE = "cookie_mintly_consent";

export async function getDistinctId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(DISTINCT_ID_COOKIE)?.value ?? null;
}

export async function hasAnalyticsConsent(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(CONSENT_COOKIE)?.value === "accepted";
}

type CaptureEventParams = {
  event: string;
  properties?: Record<string, unknown>;
};

// Every posthog-node call in this app should go through here — it's the one
// place that enforces the "only track after the cookie banner is accepted"
// rule, so no capture site has to remember to check consent itself.
export async function captureEvent(params: CaptureEventParams): Promise<void> {
  const { event, properties } = params;

  const [distinctId, hasConsent] = await Promise.all([
    getDistinctId(),
    hasAnalyticsConsent(),
  ]);

  if (!hasConsent || !distinctId) {
    return;
  }

  posthogClient.capture({ distinctId, event, properties });
}

// Resolved server-side (e.g. in a page's Server Component) so an A/B test
// can pick which copy/layout to render before the first byte goes out —
// no client-side flag check, so no flash of the wrong variant.
export async function getFeatureFlag(
  key: string,
): Promise<string | boolean | undefined> {
  const [distinctId, hasConsent] = await Promise.all([
    getDistinctId(),
    hasAnalyticsConsent(),
  ]);

  if (!hasConsent || !distinctId) {
    return undefined;
  }

  const flags = await posthogClient.evaluateFlags(distinctId);
  return flags.getFlag(key);
}
