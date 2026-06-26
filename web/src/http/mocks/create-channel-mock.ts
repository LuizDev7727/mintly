import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import type { CreateChannelResponse } from "../channel/create-channel.http";

export const createChannelMock = http.post<
  { org: string },
  { name: string },
  CreateChannelResponse
>(
  "http://localhost:3000/api/organizations/:org/channels",
  async () => {
    return HttpResponse.json({ channelId: faker.string.uuid() }, { status: 201 });
  },
);
