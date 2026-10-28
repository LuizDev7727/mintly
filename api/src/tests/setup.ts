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

// Same reason for the two mocks below: tests must never reach R2 or start a
// real Trigger.dev run. They live here (and not in each test file) because this
// file imports the app before any test file runs, so a vi.mock declared later
// would not replace the modules the app already loaded.
vi.mock("@/utils/cloudflare/check-file-exists.ts", () => ({
  checkFileExists: vi.fn(async () => undefined),
}));

vi.mock("@trigger.dev/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@trigger.dev/sdk")>();

  return {
    ...actual,
    tasks: {
      ...actual.tasks,
      trigger: vi.fn(async () => ({ id: "run_test" })),
    },
    runs: {
      ...actual.runs,
      cancel: vi.fn(async () => undefined),
    },
  };
});

// The OAuth callbacks exchange the code with Google, TikTok and Instagram. A
// test must never reach them, so only the exchange is replaced: the state
// validation that runs before it is the real one.
vi.mock("@/functions/integration/connect-youtube.ts", () => ({
  connectYoutube: vi.fn(async () => undefined),
}));

vi.mock("@/functions/integration/connect-tiktok.ts", () => ({
  connectTikTok: vi.fn(async () => undefined),
}));

vi.mock("@/functions/integration/connect-instagram.ts", () => ({
  connectInstagram: vi.fn(async () => undefined),
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
