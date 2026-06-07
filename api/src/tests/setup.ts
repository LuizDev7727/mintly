import { beforeAll, afterAll } from "vitest";
import { test } from "@/tests/auth-test.ts";
import { server } from "@/app.ts";

export let testUser: ReturnType<typeof test.createUser>;
export let authHeaders: Record<string, string>;

beforeAll(async () => {
  await server.ready();

  testUser = test.createUser();
  // await test.saveUser(testUser);

  const headers = await test.getAuthHeaders({ userId: testUser.id });
  authHeaders = Object.fromEntries(headers.entries());
});

afterAll(async () => {
  // await test.deleteUser(testUser.id);
  await server.close();
});
