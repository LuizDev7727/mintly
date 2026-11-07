import request from "supertest";
import { describe, expect, test } from "vitest";
import { server } from "@/app.ts";
import { authHeaders, testOrgSlug } from "@/tests/setup.ts";

describe("GET [/api/organization/active]", () => {
  test("should return 200 with the active organization", async () => {
    const response = await request(server.server).get("/api/organization/active").set(authHeaders);

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("organization");
    expect(response.body.organization.slug).toEqual(testOrgSlug);
  });
});
