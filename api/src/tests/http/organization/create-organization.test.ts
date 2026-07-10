import { describe, test, expect } from "vitest";
import request from "supertest";
import { server } from "@/app.ts";
import { authHeaders } from "@/tests/setup.ts";
import { faker } from "@faker-js/faker";

describe("POST [/api/organizations]", () => {
  test("should return 200 with organizationId", async () => {
    const name = faker.company.name();

    const response = await request(server.server)
      .post("/api/organizations")
      .set(authHeaders)
      .send({ name, slug: faker.helpers.slugify(name).toLowerCase() });

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty("organizationId");
    expect(typeof response.body.organizationId).toBe("string");
  });

  test("should return 409 when organization slug already exists", async () => {
    const name = faker.company.name();

    await request(server.server)
      .post("/api/organizations")
      .set(authHeaders)
      .send({ name, slug: faker.helpers.slugify(name).toLowerCase() });

    const response = await request(server.server)
      .post("/api/organizations")
      .set(authHeaders)
      .send({ name, slug: faker.helpers.slugify(name).toLowerCase() });

    expect(response.status).toEqual(409);
  });

  test("should return 400 when body is missing", async () => {
    const response = await request(server.server)
      .post("/api/organizations")
      .set(authHeaders)
      .send({});

    expect(response.status).toEqual(400);
  });
});
