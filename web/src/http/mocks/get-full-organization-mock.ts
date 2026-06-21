import { http, HttpResponse } from "msw";

type GetFullOrganizationResponse = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  members: Array<{
    id: string;
    userId: string;
    organizationId: string;
    role: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "rejected";
    expiresAt: Date;
  }>;
  teams: Array<{
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
  }>;
};

export const getFullOrganizationMock = http.get<
  never,
  never,
  GetFullOrganizationResponse
>(
  "http://localhost:3000/api/auth/organization/get-full-organization",
  () => {
    return HttpResponse.json({
      id: "01950000-0000-7000-8000-000000000001",
      name: "Mintly",
      slug: "mintly",
      logo: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      metadata: {},
      members: [],
      invitations: [],
      teams: [],
    });
  },
);
