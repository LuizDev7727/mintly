import { api } from "../api";

export type SkipOnboardingInviteResponse = {
  step: number;
};

export async function skipOnboardingInviteHttp(): Promise<SkipOnboardingInviteResponse> {
  const { data } = await api.post<SkipOnboardingInviteResponse>(
    "/me/onboarding/skip-invite",
  );
  return data;
}
