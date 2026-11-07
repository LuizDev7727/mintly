import { api } from "../api";

type AddColorParams = {
  orgSlug: string;
  channelId: string;
  r: number;
  g: number;
  b: number;
};

export type AddColorResponse = {
  colorId: string;
};

export async function addColorHttp(
  params: AddColorParams,
): Promise<AddColorResponse> {
  const { orgSlug, channelId, r, g, b } = params;

  const { data } = await api.post<AddColorResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/colors`,
    { r, g, b },
  );

  return data;
}
