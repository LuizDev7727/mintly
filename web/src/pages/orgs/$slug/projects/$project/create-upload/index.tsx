import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/orgs/$slug/projects/$project/create-upload/",
)({
  component: CreateUploadPage,
});

function CreateUploadPage() {
  return <div>Hello "/orgs/$slug/projects/$project/create-upload/"!</div>;
}
