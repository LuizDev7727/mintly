import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { GetOrganizationPendingInvitesResponse } from "../organization/get-organization-pending-invites.http";
import type { PendingInvite } from "@/types/pending-invite";

const pendingInvites: PendingInvite[] = Array.from({ length: 13 }, () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(["admin", "member"]),
  createdAt: faker.date.past().toISOString(),
}));

export const getOrganizationPendingInvitesMock = http.get<
  { orgSlug: string },
  never,
  GetOrganizationPendingInvitesResponse
>(
  "http://localhost:3000/api/organizations/:orgSlug/invites/pending",
  ({ request }) => {
    const { searchParams } = new URL(request.url);
    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const pageSize = 12;

    const offset = pageIndex * pageSize;
    const paginated = pendingInvites.slice(offset, offset + pageSize);

    return HttpResponse.json({
      pendingInvites: paginated,
      meta: {
        totalCount: pendingInvites.length,
        totalPages: Math.ceil(pendingInvites.length / pageSize),
      },
    });
  },
);
