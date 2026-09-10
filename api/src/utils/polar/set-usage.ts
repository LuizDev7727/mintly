import { env } from "@/env.ts";
import { polar } from "@/lib/polar.ts";

type Event =
  | "best_moments_generated"
  | "clip_rendered"
  | "thumbnail_generated"
  | "seo_generated"
  | "audio_transcribed";

const ORGANIZATIONS_TO_NOT_BILL = [
  "jhon-doe",
  "luiz-antonio",
];

type SetUsageParams = {
  externalCustomerId: string;
  eventName: Event;
  cost: { amount: number; currency: string };
  metadata: Record<string, unknown>;
};

export async function setUsage(props: SetUsageParams): Promise<void> {
  const { externalCustomerId, eventName, cost, metadata } = props;

  if (
    env.NODE_ENV === "production" &&
    ORGANIZATIONS_TO_NOT_BILL.includes(externalCustomerId)
  ) {
    return;
  }

  await polar.events.ingest({
    events: [
      {
        name: eventName,
        externalCustomerId,
        metadata: {
          ...metadata,
          _cost: cost,
        },
      },
    ],
  });
}
