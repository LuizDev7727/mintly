import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { ProjectCard } from "@/pages/orgs/$slug/-components/project-card";

const meta = {
  title: "Components/ProjectCard",
  component: ProjectCard,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof OrganizationSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "AchismosTV",
    avatarUrl: null,
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since 1966, when designers at Letraset and James Mosley, the librarian at St Bride Printing Library, took a 1914 Cicero translation and scrambled it to make dummy text for Letraset's Body Type sheets. ",
    integrationsCount: 2,
    postsCount: 12,
    owner: {
      name: "John Doe",
      avatarUrl: null,
    },
  },
};
