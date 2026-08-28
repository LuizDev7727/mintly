import { api } from "../api";

type SendBestMomentToSocialMediaParams = {
  orgSlug: string;
  channelId: string;
  bestMomentId: string;
  integrationId: string;
};

export async function sendBestMomentToSocialMediaHttp(
  params: SendBestMomentToSocialMediaParams,
): Promise<void> {
  const { orgSlug, channelId, bestMomentId, integrationId } = params;
  await api.post(
    `/organizations/${orgSlug}/channels/${channelId}/best-moments/${bestMomentId}/send`,
    { integrationId },
  );
}
