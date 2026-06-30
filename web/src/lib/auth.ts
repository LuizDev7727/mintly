import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_BASE_URL, // The base URL of your auth server
  plugins: [organizationClient()],
});
