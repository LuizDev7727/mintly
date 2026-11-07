import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/index.css";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "../src/http/mocks/handlers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../src/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { TooltipProvider } from "../src/components/ui/tooltip";
import {
  createMemoryHistory,
  createRoute,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

initialize({ onUnhandledRequest: "bypass" });

// Components read route params with `useParams({ from })`, which throws when
// the route is not in the active matches. The in-memory router therefore
// mirrors the org/channel routes and starts at a URL that matches them.
const DEFAULT_INITIAL_ENTRY = "/orgs/mintly/channels/1";

const withProviders: Decorator = (Story, context) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rootRoute = createRootRoute({
    component: () => (
      <ThemeProvider defaultTheme="system" storageKey="mintly-ui-theme">
        <QueryClientProvider client={queryClient}>
          <NuqsAdapter>
            <TooltipProvider>
              <Story />
            </TooltipProvider>
          </NuqsAdapter>
        </QueryClientProvider>
      </ThemeProvider>
    ),
  });
  const orgRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/orgs/$slug",
  });
  const channelRoute = createRoute({
    getParentRoute: () => orgRoute,
    path: "/channels/$channel",
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([orgRoute.addChildren([channelRoute])]),
    history: createMemoryHistory({
      initialEntries: [
        context.parameters.initialEntry ?? DEFAULT_INITIAL_ENTRY,
      ],
    }),
  });

  return <RouterProvider router={router} />;
};

const preview: Preview = {
  decorators: [withProviders],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    msw: {
      handlers,
    },
  },
  loaders: [mswLoader],
};

export default preview;
