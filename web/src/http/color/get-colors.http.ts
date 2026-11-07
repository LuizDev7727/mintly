import { api } from "../api";

type GetColorsParams = {
  orgSlug: string;
  channelId: string;
};

export type GetColorsResponse = {
  colors: {
    id: string;
    hex: string;
    createdAt: string;
  }[];
};

export async function getColorsHttp(
  params: GetColorsParams,
): Promise<GetColorsResponse> {
  const { orgSlug, channelId } = params;

  const { data } = await api.get<GetColorsResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/colors`,
  );

  return data;
}
