import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";

const meta = {
  title: "Components/OrganizationSwitcher",
  component: OrganizationSwitcher,
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
} satisfies Meta<typeof OrganizationSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
