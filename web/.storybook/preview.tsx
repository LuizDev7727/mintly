import type { Decorator, Preview } from "@storybook/react-vite";
import "../src/index.css";
import { initialize, mswLoader } from "msw-storybook-addon";
import { handlers } from "../src/http/mocks/handlers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../src/components/theme-provider";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";

initialize({ onUnhandledRequest: "bypass" });

const withProviders: Decorator = (Story) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <ThemeProvider defaultTheme="system" storageKey="mintly-ui-theme">
          <QueryClientProvider client={queryClient}>
            <Story />
          </QueryClientProvider>
        </ThemeProvider>
      ),
    }),
    history: createMemoryHistory(),
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
