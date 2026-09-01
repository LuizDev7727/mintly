import { server } from "./app.ts";
import { env } from "./env.ts";
import { infisical } from "./lib/infisical.ts";

await infisical.auth().universalAuth.login({
  clientId: env.INFISICAL_CLIENT_ID,
  clientSecret: env.INFISICAL_CLIENT_SECRET,
});

server.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log(`🚀 HTTP server running on http://localhost:${env.PORT}`);
  console.log(`📚 Swagger on http://localhost:${env.PORT}/api/docs`);
});
