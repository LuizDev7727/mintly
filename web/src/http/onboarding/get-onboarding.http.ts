import { api } from "../api";

export type GetOnboardingResponse = {
  step: number;
  total: number;
  completed: boolean;
  organizationSlug: string | null;
  channelId: string | null;
};

export async function getOnboardingHttp(): Promise<GetOnboardingResponse> {
  const { data } = await api.get<GetOnboardingResponse>("/me/onboarding");
  return data;
}
