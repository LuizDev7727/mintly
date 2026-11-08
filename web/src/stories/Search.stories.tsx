import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "@/components/search";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta = {
  title: "Components/Search",
  component: Search,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
