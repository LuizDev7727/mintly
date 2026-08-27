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
        slug: "fox-news",
        avatar: null,
        postsCount: 142,
        integrationsCount: 3,
        postsSeries: [186, 305, 237, 73, 209, 214],
      },
      {
        id: "2",
        name: "CNN",
        slug: "cnn",
        avatar: null,
        postsCount: 98,
        integrationsCount: 2,
        postsSeries: [200, 200],
      },
      {
        id: "3",
        name: "ESPN",
        slug: "espn",
        avatar: null,
        postsCount: 317,
        integrationsCount: 5,
        postsSeries: [317],
      },
      {
        id: "4",
        name: "NBC Sports",
        slug: "nbc-sports",
        avatar: null,
        postsCount: 204,
        integrationsCount: 4,
        postsSeries: [204],
      },
      {
        id: "5",
        name: "The Tonight Show",
        slug: "tonight-show",
        avatar: null,
        postsCount: 56,
        integrationsCount: 1,
        postsSeries: [56],
      },
      {
        id: "6",
        name: "60 Minutes",
        slug: "60-minutes",
        avatar: null,
        postsCount: 88,
        integrationsCount: 2,
        postsSeries: [88],
      },
    ],
  });
});
