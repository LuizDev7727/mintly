import { http, HttpResponse } from "msw";
import type { GetOnboardingResponse } from "../onboarding/get-onboarding.http";

export const getOnboardingMock = http.get<
  never,
  never,
  GetOnboardingResponse
>("http://localhost:3000/api/me/onboarding", () => {
  return HttpResponse.json({
    step: 0,
    total: 3,
    completed: false,
    organizationSlug: "test-user",
    channelId: null,
  });
});
