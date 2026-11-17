import { api } from "../api";

type SendBestMomentToSocialMediaParams = {
  orgSlug: string;
  channelId: string;
  bestMomentId: string;
  integrationId: string;
  // ISO 8601. Sem o campo (ou null), publica na hora.
  scheduledTo?: string | null;
};

export async function sendBestMomentToSocialMediaHttp(
  params: SendBestMomentToSocialMediaParams,
): Promise<void> {
  const { orgSlug, channelId, bestMomentId, integrationId, scheduledTo } =
    params;
  await api.post(
    `/organizations/${orgSlug}/channels/${channelId}/best-moments/${bestMomentId}/send`,
    { integrationId, scheduledTo: scheduledTo ?? null },
  );
}
