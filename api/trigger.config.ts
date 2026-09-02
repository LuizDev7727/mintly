import { defineConfig } from "@trigger.dev/sdk";
import { ffmpeg } from "@trigger.dev/build/extensions/core";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";
import { InfisicalSDK } from "@infisical/sdk";
import { env } from "@/env.ts";

export default defineConfig({
  project: "proj_nzoodvxxkshyumjxnzmn",
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["src/infra/trigger"],
  build: {
    extensions: [
      ffmpeg(),
      syncEnvVars(async (ctx) => {

        const client = new InfisicalSDK();

        await client.auth().universalAuth.login({
          clientId: env.INFISICAL_CLIENT_ID,
          clientSecret: env.INFISICAL_CLIENT_SECRET,
        });

        const { secrets } = await client.secrets().listSecrets({
          environment: "prod",
          projectId: env.INFISICAL_PROJECT_ID,
        });

        return secrets.map((secret) => ({
          name: secret.secretKey,
          value: secret.secretValue,
        }));
      }),
    ],
  },
});
