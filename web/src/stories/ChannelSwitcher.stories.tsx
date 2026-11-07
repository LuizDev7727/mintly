import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChannelSwitcher } from "@/components/channel-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta = {
  title: "Components/ChannelSwitcher",
  component: ChannelSwitcher,
  parameters: {
    layout: "centered",
  },
  args: {
    orgSlug: "mintly",
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof ChannelSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
