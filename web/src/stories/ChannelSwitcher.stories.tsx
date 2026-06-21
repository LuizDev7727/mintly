import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelSwitcher } from "@/components/channel-switcher";

const meta = {
  title: "Components/ChannelSwitcher",
  component: ChannelSwitcher,
  parameters: {
    layout: "centered",
  },
  args: {
    orgSlug: "mintly",
  },
} satisfies Meta<typeof ChannelSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
