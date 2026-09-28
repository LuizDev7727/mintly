import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { delay, http, HttpResponse } from "msw";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Search } from "@/components/search";
import type { GetSearchResultsResponse } from "@/http/search/get-search-results.http";

const SEARCH_ENDPOINT = "http://localhost:3000/api/organizations/:orgSlug/search";

function withOrgRoute(Story: () => React.ReactElement) {
  const rootRoute = createRootRoute();
  const orgRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "orgs/$slug",
    component: () => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([orgRoute]),
    history: createMemoryHistory({
      initialEntries: ["/orgs/mintly"],
    }),
  });

  return <RouterProvider router={router} />;
}

async function openSearch(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button"));
  return within(document.body);
}

const meta = {
  title: "Components/Search",
  component: Search,
  decorators: [withOrgRoute],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TypingShortQuery: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openSearch(canvasElement);

    await userEvent.type(
      dialog.getByPlaceholderText("Search posts, projects and folders."),
      "a",
    );

    await expect(
      dialog.getByText("Type at least 2 characters to search."),
    ).toBeVisible();
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(SEARCH_ENDPOINT, async () => {
          await delay("infinite");
          return HttpResponse.json({ posts: [], projects: [], folders: [] });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = await openSearch(canvasElement);

    await userEvent.type(
      dialog.getByPlaceholderText("Search posts, projects and folders."),
      "clip",
    );

    await waitFor(
      () => expect(dialog.getByText("Searching...")).toBeVisible(),
      { timeout: 2000 },
    );
  },
};

export const NoResults: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get<{ orgSlug: string }, never, GetSearchResultsResponse>(
          SEARCH_ENDPOINT,
          () => HttpResponse.json({ posts: [], projects: [], folders: [] }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = await openSearch(canvasElement);

    await userEvent.type(
      dialog.getByPlaceholderText("Search posts, projects and folders."),
      "clip",
    );

    await waitFor(
      () => expect(dialog.getByText("No results found.")).toBeVisible(),
      { timeout: 2000 },
    );
  },
};

export const WithResults: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get<{ orgSlug: string }, never, GetSearchResultsResponse>(
          SEARCH_ENDPOINT,
          () =>
            HttpResponse.json({
              posts: [
                {
                  id: "post-1",
                  title: "How we migrated our video pipeline to Modal",
                  channelId: "channel-1",
                  thumbnailUrl:
                    "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb.webp",
                  description:
                    "A deep dive into moving GPU-heavy video processing from our own infra to Modal.",
                },
                {
                  id: "post-2",
                  title: "Draft clip with no description yet",
                  channelId: "channel-1",
                  thumbnailUrl:
                    "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb-3.webp",
                  description: "",
                },
              ],
              projects: [
                {
                  id: "project-1",
                  title: "Highlight reel - Q3 launch",
                  channelId: "channel-1",
                  thumbnailUrl:
                    "https://pub-2f07862307a848f6a37eefd05ab02ea6.r2.dev/mr-beast-thumb-2.webp",
                },
              ],
              folders: [
                { id: "folder-1", title: "Client videos", channelId: "channel-1" },
              ],
            }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = await openSearch(canvasElement);

    await userEvent.type(
      dialog.getByPlaceholderText("Search posts, projects and folders."),
      "clip",
    );

    await waitFor(
      () =>
        expect(
          dialog.getByText("How we migrated our video pipeline to Modal"),
        ).toBeVisible(),
      { timeout: 2000 },
    );
    await expect(dialog.getByText("Highlight reel - Q3 launch")).toBeVisible();
    await expect(dialog.getByText("Client videos")).toBeVisible();
    await expect(dialog.getAllByText("No description")[0]).toBeVisible();
  },
};
