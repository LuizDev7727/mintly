import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/members/")({
  head: () => ({
    meta: [
      { title: "Members | Mintly" },
      { name: "description", content: "Organization members." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  return <div />;
}
