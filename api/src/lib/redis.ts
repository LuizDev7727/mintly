import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { createClient } from "redis";

export const redis = createClient({
  url: await getInfisicalSecret({ secretName: "REDIS_URL" })
})

redis.on("error", (error) => {
  console.error("Redis client error", error);
});

await redis.connect()
