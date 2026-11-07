import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

export const authClient = createAuthClient({
  baseURL: env.VITE_API_BASE_URL, // The base URL of your auth server
  plugins: [
    organizationClient(),
    inferAdditionalFields({
      user: {
        bio: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});
