import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationSwitcher } from "@/components/organization-switcher";

const meta = {
  title: "Components/OrganizationSwitcher",
  component: OrganizationSwitcher,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof OrganizationSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
