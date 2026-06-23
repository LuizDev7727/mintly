import { beforeAll, afterAll } from "vitest";
import { server } from "@/app.ts";
import { test } from "@/lib/auth.ts";
import { faker } from "@faker-js/faker";

export let testUser: ReturnType<typeof test.createUser>;
export let testOrg: Record<string, unknown>;
export let authHeaders: Record<string, string>;

beforeAll(async () => {
  await server.ready();

  testUser = test.createUser({
    email: faker.internet.email(),
    name: faker.person.fullName(),
  });
  await test.saveUser(testUser);

  if (!test.createOrganization || !test.saveOrganization || !test.addMember) {
    throw new Error("Organization plugin not configured in testUtils");
  }

  const orgName = faker.company.name();
  const org = test.createOrganization({
    name: orgName,
    slug: faker.helpers.slugify(orgName).toLowerCase(),
  });

  testOrg = await test.saveOrganization(org);

  await test.addMember({
    userId: testUser.id,
    organizationId: org.id as string,
    role: "admin",
  });

  const headers = await test.getAuthHeaders({ userId: testUser.id });
  authHeaders = Object.fromEntries(headers.entries());
});

afterAll(async () => {
  await test.deleteUser(testUser.id);
  await server.close();
});
