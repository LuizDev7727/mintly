import { describe, test, expect } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { server } from "@/app.ts";
import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { authHeaders, testUser } from "@/tests/setup.ts";

describe("POST [/api/auth/update-user]", () => {
  test("should persist name and bio for the authenticated user", async () => {
    const name = faker.person.fullName();
    const bio = faker.lorem.sentence();

    const response = await request(server.server)
      .post("/api/auth/update-user")
      .set(authHeaders)
      .send({ name, bio });

    expect(response.status).toEqual(200);

    const [user] = await db
      .select({ name: usersTable.name, bio: usersTable.bio })
      .from(usersTable)
      .where(eq(usersTable.id, testUser.id));

    expect(user.name).toEqual(name);
    expect(user.bio).toEqual(bio);
  });

  test("should return 401 when not authenticated", async () => {
    const response = await request(server.server)
      .post("/api/auth/update-user")
      .send({ name: faker.person.fullName() });

    expect(response.status).toEqual(401);
  });
});
