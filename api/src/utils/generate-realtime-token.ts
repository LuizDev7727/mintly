import { auth } from "@trigger.dev/sdk";

type GenerateRealtimeTokenParams = {
  runId: string;
  expirationTime?: number | Date | string;
};

export async function generateRealtimeToken({
  runId,
  expirationTime = "1h",
}: GenerateRealtimeTokenParams): Promise<string> {
  return auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime,
  });
}
