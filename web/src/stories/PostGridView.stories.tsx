import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { PostGridView } from "@/pages/orgs/$slug/channels/$channel/-components/post-grid-view";
import type { Post } from "@/types/post";

function withOrgChannelRoute(Story: () => React.ReactElement) {
  const rootRoute = createRootRoute();
  const orgRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "orgs/$slug",
  });
  const channelRoute = createRoute({
    getParentRoute: () => orgRoute,
    path: "channels/$channel",
    component: () => <Story />,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([orgRoute.addChildren([channelRoute])]),
    history: createMemoryHistory({
      initialEntries: ["/orgs/mintly/channels/general"],
    }),
  });

  return <RouterProvider router={router} />;
}

const basePost: Post = {
  id: "post-1",
  runId: "run-1",
  thumbnailUrl: "https://picsum.photos/seed/mintly-post-1/640/360",
  title: "How we migrated our video pipeline to Modal",
  size: 128_000_000,
  type: "video/mp4",
  status: "CANCELED",
  duration: 754,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  publishAt: null,
  socialsToPost: [
    {
      id: "social-1",
      socialName: "Mintly",
      social: "YOUTUBE",
      avatarUrl: null,
    },
    {
      id: "social-2",
      socialName: "Mintly Clips",
      social: "TIKTOK",
      avatarUrl: null,
    },
  ],
  author: {
    name: "Luiz Antônio",
    avatarUrl: null,
  },
};

const posts: Post[] = [
  basePost,
  {
    ...basePost,
    id: "post-2",
    title: "Live coding: building the AI image generation screen",
    status: "SCHEDULED",
    thumbnailUrl: "https://picsum.photos/seed/mintly-post-2/640/360",
    duration: 1820,
    socialsToPost: [basePost.socialsToPost[0]],
  },
  {
    ...basePost,
    id: "post-3",
    title: "Behind the scenes of the WhisperX transcription service",
    status: "TRANSCRIBING",
    thumbnailUrl: null,
    duration: 0,
  },
  {
    ...basePost,
    id: "post-4",
    title: "Something went wrong while encoding this one",
    status: "ERROR",
    thumbnailUrl: "https://picsum.photos/seed/mintly-post-4/640/360",
    duration: 342,
  },
  {
    ...basePost,
    id: "post-5",
    title: "Draft that got canceled before publishing",
    status: "CANCELED",
    thumbnailUrl: "https://picsum.photos/seed/mintly-post-5/640/360",
    duration: 96,
  },
];

const meta = {
  title: "Components/PostGridView",
  component: PostGridView,
  decorators: [withOrgChannelRoute],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PostGridView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    posts,
  },
};

export const Empty: Story = {
  args: {
    posts: [],
  },
};
