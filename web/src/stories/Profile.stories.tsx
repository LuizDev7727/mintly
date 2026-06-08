import type { Meta, StoryObj } from "@storybook/react-vite";
import { Profile } from "@/components/profile";

const meta = {
  title: "Components/Profile",
  component: Profile,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
