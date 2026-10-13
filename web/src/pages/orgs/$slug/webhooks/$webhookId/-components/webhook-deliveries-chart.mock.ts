import type { WebhookLog } from "@/http/webhook/get-webhook.http"
import type { WebhookLogStatus } from "@/types/webhook"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

// PRNG determinístico: o gráfico mockado não muda a cada render.
function createRandom(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const TRIGGER_PATHS = ["/hooks/project.created", "/hooks/post.published", "/hooks/clip.rendered"]

/**
 * Gera entregas no mesmo formato de `GET /webhooks/:id` (`WebhookLog[]`) dos
 * últimos 7 dias, com um pico de falhas ~40min atrás para simular um incidente.
 */
export function createMockWebhookLogs(now = Date.now()): WebhookLog[] {
  const random = createRandom(42)
  const logs: WebhookLog[] = []
  const incidentStart = now - 40 * MINUTE
  const incidentEnd = now - 25 * MINUTE

  for (let time = now - 7 * DAY; time <= now; time += 10 * MINUTE) {
    const hourOfDay = new Date(time).getHours()
    const busyHours = hourOfDay >= 9 && hourOfDay <= 21
    const deliveries = Math.floor(random() * (busyHours ? 7 : 3))
    const isIncident = time >= incidentStart && time <= incidentEnd

    for (let i = 0; i < deliveries; i++) {
      const createdAt = time + Math.floor(random() * 10 * MINUTE)
      const failureChance = isIncident ? 0.7 : 0.04
      const isRecent = now - createdAt < 30_000

      const status: WebhookLogStatus = isRecent
        ? "PENDING"
        : random() < failureChance
          ? "FAILED"
          : "SUCCESS"

      const pathname = TRIGGER_PATHS[Math.floor(random() * TRIGGER_PATHS.length)]
      const failed = status === "FAILED"

      logs.push({
        id: `mock-${logs.length}`,
        url: `https://api.acme.com${pathname}`,
        status,
        method: "POST",
        pathname,
        ip: "203.0.113.10",
        statusCode: failed ? 504 : status === "SUCCESS" ? 200 : 0,
        contentType: "application/json",
        contentLength: 512,
        queryParams: null,
        headers: {
          "content-type": "application/json",
          "user-agent": "Mintly-Webhooks/1.0",
        },
        body: JSON.stringify({ event: pathname.replace("/hooks/", ""), id: `evt_${logs.length}` }, null, 2),
        errorReason: failed ? "Timeout after 5000ms" : null,
        numberOfRetries: failed ? 3 : 0,
        createdAt: new Date(createdAt).toISOString(),
        finishedAt: status === "PENDING" ? null : new Date(createdAt + 250).toISOString(),
      })
    }
  }

  return logs
}
