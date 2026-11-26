import { describe, test, expect } from "vitest";
import request from "supertest";
import { faker } from "@faker-js/faker";
import { server } from "@/app.ts";
import { test as authTest } from "@/lib/auth.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";
import { makeFakeUser } from "@/tests/factories/make-fake-user.ts";
import { makeFakeOrganization } from "@/tests/factories/make-fake-organization.ts";
import { makeFakeMember } from "@/tests/factories/make-fake-member.ts";

describe("GET [/api/me/onboarding]", () => {
  test("should return 401 without a session", async () => {
    const response = await request(server.server).get("/api/me/onboarding");

    expect(response.status).toEqual(401);
  });

  test("should start a new user at step 0 with the automatic organization", async () => {
    const response = await request(server.server)
      .get("/api/me/onboarding")
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      step: 0,
      total: 3,
      completed: false,
      organizationSlug: testOrgSlug,
      channelId: null,
    });
  });
});

describe("POST [/api/me/onboarding/skip-invite]", () => {
  test("should return 401 without a session", async () => {
    const response = await request(server.server).post(
      "/api/me/onboarding/skip-invite",
    );

    expect(response.status).toEqual(401);
  });

  test("should skip the invite step, advance on channel creation and refuse a second skip", async () => {
    const skip = await request(server.server)
      .post("/api/me/onboarding/skip-invite")
      .set(authHeaders);

    expect(skip.status).toEqual(200);
    expect(skip.body).toEqual({ step: 1 });

    const secondSkip = await request(server.server)
      .post("/api/me/onboarding/skip-invite")
      .set(authHeaders);

    expect(secondSkip.status).toEqual(409);

    const createChannel = await request(server.server)
      .post(`/api/organizations/${testOrgSlug}/channels`)
      .set(authHeaders)
      .send({ name: faker.word.noun(), description: faker.lorem.sentence() });

    expect(createChannel.status).toEqual(201);

    const onboarding = await request(server.server)
      .get("/api/me/onboarding")
      .set(authHeaders);

    expect(onboarding.body.step).toEqual(2);
    expect(onboarding.body.channelId).toEqual(createChannel.body.channelId);
  });

  test("should advance the onboarding when the invite step is satisfied by an invite", async () => {
    const { userId } = await makeFakeUser();
    const { organizationSlug } = await makeFakeOrganization(userId, {
      name: faker.company.name(),
    });
    await makeFakeMember(organizationSlug, userId);
    const headers = Object.fromEntries(
      (await authTest.getAuthHeaders({ userId })).entries(),
    );

    const invite = await request(server.server)
      .post(`/api/organizations/${organizationSlug}/invites`)
      .set(headers)
      .send({ email: faker.internet.email() });

    expect(invite.status).toEqual(201);

    const onboarding = await request(server.server)
      .get("/api/me/onboarding")
      .set(headers);

    expect(onboarding.body.step).toEqual(1);
  });

  test("should not leak progress between users", async () => {
    const { userId } = await makeFakeUser();
    const { organizationSlug } = await makeFakeOrganization(userId, {
      name: faker.company.name(),
    });
    await makeFakeMember(organizationSlug, userId);

    const headers = await authTest.getAuthHeaders({ userId });

    const response = await request(server.server)
      .get("/api/me/onboarding")
      .set(Object.fromEntries(headers.entries()));

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
      step: 0,
      organizationSlug,
      channelId: null,
    });

    const skip = await request(server.server)
      .post("/api/me/onboarding/skip-invite")
      .set(Object.fromEntries(headers.entries()));

    expect(skip.body).toEqual({ step: 1 });
  });
});
