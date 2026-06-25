import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelCard } from "@/pages/orgs/$slug/-components/channel-card";

const meta = {
  title: "Components/ChannelCard",
  component: ChannelCard,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ChannelCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "AchismosTV",
    slug: "1212",
    integrationsCount: 2,
    totalSize: 0,
    postsCount: 12,
    postsSize: [],
  },
};
