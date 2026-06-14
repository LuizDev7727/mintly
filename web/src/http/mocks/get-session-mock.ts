import { http, HttpResponse } from "msw";

type GetSessionResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | undefined;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress: string | undefined;
    userAgent: string | undefined;
    createdAt: Date;
    updatedAt: Date;
  };
};

export const getSessionMock = http.get<never, never, GetSessionResponse>(
  "http://localhost:3000/api/auth/get-session",
  () => {
    return HttpResponse.json({
      user: {
        id: "01950000-0000-7000-8000-000000000010",
        name: "Keith Kennedy",
        email: "k.kennedy@coss.com",
        emailVerified: true,
        image: undefined,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
      session: {
        id: "01950000-0000-7000-8000-000000000020",
        userId: "01950000-0000-7000-8000-000000000010",
        expiresAt: new Date("2025-01-01T00:00:00.000Z"),
        token: "mock-session-token",
        ipAddress: undefined,
        userAgent: undefined,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      },
    });
  },
);
