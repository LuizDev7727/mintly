import { http, HttpResponse } from "msw";
import type { SkipOnboardingInviteResponse } from "../onboarding/skip-onboarding-invite.http";

export const skipOnboardingInviteMock = http.post<
  never,
  never,
  SkipOnboardingInviteResponse
>("http://localhost:3000/api/me/onboarding/skip-invite", () => {
  return HttpResponse.json({ step: 1 });
});
