import type { Meta, StoryObj } from "@storybook/react-vite";
import Search from "@/components/search";

const meta = {
  title: "Components/Search",
  component: Search,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Search>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
