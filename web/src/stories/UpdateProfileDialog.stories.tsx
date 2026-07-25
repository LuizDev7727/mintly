import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateProfileDialog } from "@/components/update-profile-dialog";

const meta = {
  title: "Components/UpdateProfileDialog",
  component: UpdateProfileDialog,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <DropdownMenu open>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Story />
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  ],
} satisfies Meta<typeof UpdateProfileDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "John Doe",
    logo: null,
    bio: null,
  },
};
