import { api } from "../api";

type SendBestMomentToSocialMediaParams = {
  channelId: string;
  bestMomentId: string;
  integrationId: string;
};

export async function sendBestMomentToSocialMediaHttp(
  params: SendBestMomentToSocialMediaParams,
): Promise<void> {
  const { channelId, bestMomentId, integrationId } = params;
  await api.post(
    `/channels/${channelId}/best-moments/${bestMomentId}/send`,
    { integrationId },
  );
}
