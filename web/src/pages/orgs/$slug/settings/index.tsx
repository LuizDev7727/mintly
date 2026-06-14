import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orgs/$slug/settings/")({
  head: () => ({
    meta: [
      { title: "Settings | Mintly" },
      { name: "description", content: "Organization settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return <div />;
}
