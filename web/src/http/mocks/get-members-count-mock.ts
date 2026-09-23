import { http, HttpResponse } from "msw";
import type { GetMembersCountResponse } from "../organization/get-members-count.http";

export const getMembersCountMock = http.get<
  { orgSlug: string },
  never,
  GetMembersCountResponse
>("http://localhost:3000/api/organizations/:orgSlug/members/count", () => {
  return HttpResponse.json({ count: 13 });
});
