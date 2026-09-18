import type { GetChannelsResponse } from "../channel/get-channels.http";
import { http, HttpResponse } from "msw";

export const getChannelsMock = http.get<
  { orgSlug: string },
  never,
  GetChannelsResponse
>("http://localhost:3000/api/organizations/:orgSlug/channels", () => {
  return HttpResponse.json({
    channels: [
      {
        id: "1",
        name: "Fox News",
        avatar: null,
        description: "24-hour cable news channel.",
        createdAt: new Date("2025-11-01").toISOString(),
      },
      {
        id: "2",
        name: "CNN",
        avatar: null,
        description: "Breaking news, latest headlines and live updates.",
        createdAt: new Date("2025-11-05").toISOString(),
      },
      {
        id: "3",
        name: "ESPN",
        avatar: null,
        description: "Sports highlights and live coverage.",
        createdAt: new Date("2025-11-10").toISOString(),
      },
      {
        id: "4",
        name: "NBC Sports",
        avatar: null,
        description: "Sports news and event coverage.",
        createdAt: new Date("2025-11-12").toISOString(),
      },
      {
        id: "5",
        name: "The Tonight Show",
        avatar: null,
        description: "Late-night talk show clips and highlights.",
        createdAt: new Date("2025-11-18").toISOString(),
      },
      {
        id: "6",
        name: "60 Minutes",
        avatar: null,
        description: "Investigative journalism and news segments.",
        createdAt: new Date("2025-11-20").toISOString(),
      },
    ],
  });
});
