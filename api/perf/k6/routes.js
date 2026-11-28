import http from "k6/http";
import { check, group } from "k6";
import { BASE_URL, CHANNEL_ID, ORG_SLUG, login } from "./lib/auth.js";

// Rotas autenticadas que só leem do banco (sem Trigger.dev, R2 ou Polar).
// Dataset vindo de `pnpm db:seed` + `pnpm db:seed:perf`.
const ORG = `${BASE_URL}/api/organizations/${ORG_SLUG}`;
const CHANNEL = `${ORG}/channels/${CHANNEL_ID}`;

export const options = {
  stages: [
    { duration: "10s", target: 20 }, // aquecimento
    { duration: "40s", target: 20 }, // carga constante
    { duration: "10s", target: 60 }, // pico
    { duration: "30s", target: 60 },
    { duration: "10s", target: 0 }, // resfriamento
  ],
  // Valores iniciais: ajustar depois da primeira rodada real (baseline).
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    "http_req_duration{name:list-channels}": ["p(95)<300"],
    "http_req_duration{name:list-projects}": ["p(95)<500"],
    "http_req_duration{name:list-projects-filtered}": ["p(95)<500"],
    "http_req_duration{name:list-posts}": ["p(95)<500"],
    "http_req_duration{name:list-posts-filtered}": ["p(95)<500"],
    "http_req_duration{name:list-folders}": ["p(95)<300"],
    "http_req_duration{name:folders-tree}": ["p(95)<500"],
    "http_req_duration{name:search}": ["p(95)<500"],
  },
};

export function setup() {
  return { cookie: login() };
}

function get(url, name, cookie, expectedKey) {
  const res = http.get(url, { headers: { Cookie: cookie }, tags: { name } });

  check(res, {
    [`${name}: status 200`]: (r) => r.status === 200,
    [`${name}: corpo esperado`]: (r) => r.json(expectedKey) !== undefined,
  });
}

export default function (data) {
  const { cookie } = data;

  group("listagens", () => {
    get(`${ORG}/channels`, "list-channels", cookie, "channels");
    get(`${CHANNEL}/projects?pageIndex=0`, "list-projects", cookie, "projects");
    get(
      `${CHANNEL}/projects?pageIndex=2&titleFilter=lorem`,
      "list-projects-filtered",
      cookie,
      "projects",
    );
    get(`${CHANNEL}/posts?pageIndex=0`, "list-posts", cookie, "posts");
    get(
      `${CHANNEL}/posts?pageIndex=1&statusFilter=PUBLISHED`,
      "list-posts-filtered",
      cookie,
      "posts",
    );
    get(`${CHANNEL}/folders`, "list-folders", cookie, "folders");
    get(`${CHANNEL}/folders/tree`, "folders-tree", cookie, "folders");
  });

  group("busca", () => {
    get(`${ORG}/search?query=lorem`, "search", cookie, "posts");
  });
}
