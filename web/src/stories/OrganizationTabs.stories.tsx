import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationTabs } from "@/components/organization-tabs";

const meta = {
  title: "Components/OrganizationTabs",
  component: OrganizationTabs,
  parameters: {
    layout: "centered",
  },
  args: {
    slug: "mintly",
  },
} satisfies Meta<typeof OrganizationTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
