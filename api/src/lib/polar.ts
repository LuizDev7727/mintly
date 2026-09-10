import { Polar } from "@polar-sh/sdk";
import { env } from "@/env.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

export const polar = new Polar({
  accessToken: await getInfisicalSecret({ secretName: "POLAR_ACCESS_TOKEN" }),
  server: env.NODE_ENV === "production" ? "production" : "sandbox",
});
