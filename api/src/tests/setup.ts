import { beforeAll, afterAll } from "vitest";
import { server } from "@/app.ts";
import { test } from "@/lib/auth.ts";
import { faker } from "@faker-js/faker";
import { makeFakeOrganization } from "./factories/make-fake-organization.ts";
import { makeFakeMember } from "./factories/make-fake-member.ts";

export let testUser: ReturnType<typeof test.createUser>;
export let testOrgSlug: string;
export let authHeaders: Record<string, string>;

beforeAll(async () => {
  await server.ready();

  testUser = test.createUser({
    email: faker.internet.email(),
    name: faker.person.fullName(),
  });
  testUser = await test.saveUser(testUser);

  const orgName = faker.company.name();

  const { organizationSlug } = await makeFakeOrganization(testUser.id, { name: orgName })

  await makeFakeMember(organizationSlug, testUser.id)

  const headers = await test.getAuthHeaders({ userId: testUser.id });
  authHeaders = Object.fromEntries(headers.entries());

  testOrgSlug = organizationSlug;
});

afterAll(async () => {
  await test.deleteUser(testUser.id);
  await server.close();
});
