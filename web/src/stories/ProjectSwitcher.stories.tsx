import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProjectSwitcher } from "@/components/project-switcher";

const meta = {
  title: "Components/ProjectSwitcher",
  component: ProjectSwitcher,
  parameters: {
    layout: "centered",
  },
  args: {
    orgSlug: "mintly",
  },
} satisfies Meta<typeof ProjectSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
