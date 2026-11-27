import http from "k6/http";
import { check } from "k6";

// Piso do Fastify: /api/health não toca em banco, Redis nem sessão.
// Qualquer regressão aqui vem do servidor/runtime, não das rotas de negócio.
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "10s", target: 50 }, // aquecimento
    { duration: "30s", target: 50 }, // carga constante
    { duration: "10s", target: 200 }, // pico
    { duration: "30s", target: 200 },
    { duration: "10s", target: 0 }, // resfriamento
  ],
  // Valores iniciais: ajustar depois da primeira rodada real (baseline).
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<200", "p(99)<500"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);

  check(res, {
    "status é 200": (r) => r.status === 200,
    "body é { status: ok }": (r) => r.json("status") === "ok",
  });
}
