type Event =
  | "best_moments_generated"
  | "clip_rendered"
  | "thumbnail_generated"
  | "seo_generated"
  | "audio_transcribed";

type SetUsageParams = {
  externalCustomerId: string;
  eventName: Event;
  cost: { amount: number; currency: string };
  metadata: Record<string, unknown>;
};

// TODO: no-op enquanto o billing via Polar está fora do ar (nenhum evento de uso é enviado).
export async function setUsage(_props: SetUsageParams): Promise<void> {}
