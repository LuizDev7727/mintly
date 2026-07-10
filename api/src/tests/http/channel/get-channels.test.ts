import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

describe("GET [/api/organizations/:orgSlug/channels]", () => {
  test("should return 200 with channels array", async () => {
    const response = await request(server.server)
      .get(`/api/organizations/${testOrgSlug}/channels`)
      .set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("channels");
    expect(Array.isArray(response.body.channels)).toBe(true);
  });
});
