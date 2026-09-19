import { beforeAll, afterAll, vi } from "vitest";
import { server } from "@/app.ts";
import { test } from "@/lib/auth.ts";
import { faker } from "@faker-js/faker";
import { makeFakeOrganization } from "./factories/make-fake-organization.ts";
import { makeFakeMember } from "./factories/make-fake-member.ts";

// Tests must not call Trigger.dev. The real generateRealtimeToken needs
// TRIGGER_SECRET_KEY, which exists in a developer's .env but not in CI, so any
// list endpoint returning an ENCODING/PROCESSING item answered 500 there.
vi.mock("@/utils/generate-realtime-token.ts", () => ({
  generateRealtimeToken: vi.fn(async () => "test-realtime-token"),
}));

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
