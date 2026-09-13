if (import.meta.env.DEV) {
  import("react-grab");
}

import * as Sentry from "@sentry/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./route-tree.gen.ts";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { enableMSW } from "./http/mocks/index.ts";
import { env } from "./env.ts";

// Create a new router instance
const router = createRouter({ routeTree });

Sentry.init({
  dsn: env.VITE_SENTRY_DSN,
  debug: true,
  environment: env.VITE_NODE_ENV,
  integrations: [
    // tanstackRouterBrowserTracingIntegration already extends browserTracingIntegration —
    // adding the plain one too shares the "BrowserTracing" name and silently wins the dedupe,
    // dropping the router-aware instrumentation.
    Sentry.tanstackRouterBrowserTracingIntegration(router),
  ],
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
  },

  // Setting a sample rate is required for sending performance data.
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control.
  tracesSampleRate: 1.0,
  propagateTraceparent: true, // faz o Sentry mandar o header 'traceparent' (W3C)
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  //
  // https://mintly-api-prod.fly.dev
  tracePropagationTargets: [
    /^\//,                                  // requisições relativas (mesmo domínio)
    /^http:\/\/localhost:\d+\/api/,           // localhost em dev, qualquer porta
    /^https:\/\/mintly-api-prod\.fly\.dev/,         // API pública em produção
  ],
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

enableMSW().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
});
