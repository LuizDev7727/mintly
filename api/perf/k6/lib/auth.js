import http from "k6/http";
import { check, fail } from "k6";

export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Usuário, organização e canal criados por `pnpm db:seed` (src/infra/db/seed.ts).
export const E2E_USER = {
  email: __ENV.PERF_EMAIL || "testuser@gmail.com",
  password: __ENV.PERF_PASSWORD || "DwayneJ781@",
};
export const ORG_SLUG = __ENV.PERF_ORG_SLUG || "test-user";
export const CHANNEL_ID =
  __ENV.PERF_CHANNEL_ID || "019f1b80-42cf-79bb-b828-1cff43be9900";

const SESSION_COOKIE = "better-auth.session_token";

// Faz o login uma única vez (no setup do k6) e devolve o header Cookie. Logar a
// cada iteração mediria o scrypt do better-auth, não as rotas.
export function login() {
  const res = http.post(
    `${BASE_URL}/api/auth/sign-in/email`,
    JSON.stringify(E2E_USER),
    { headers: { "Content-Type": "application/json" }, tags: { name: "login" } },
  );

  const token = res.cookies[SESSION_COOKIE]?.[0]?.value;

  if (!check(res, { "login retornou 200": (r) => r.status === 200 }) || !token) {
    fail(`login falhou (status ${res.status}): ${res.body}`);
  }

  return `${SESSION_COOKIE}=${token}`;
}
