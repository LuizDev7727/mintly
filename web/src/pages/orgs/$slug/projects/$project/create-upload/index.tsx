import { createFileRoute } from "@tanstack/react-router";
import { CreatePostForm } from "./-components/create-post-form";

export const Route = createFileRoute(
  "/orgs/$slug/projects/$project/create-upload/",
)({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Create a new post for your project",
      },
      { title: "Create Post | Mintly" },
    ],
  }),
  component: CreateUploadPage,
});

function CreateUploadPage() {
  return (
    <CreatePostForm
      integrations={[
        {
          id: "21321",
          email: "johndoe@gmail.com",
          name: "John Doe",
          provider: "YOUTUBE",
          avatarUrl: null,
        },
        {
          id: "21321",
          email: "achismostv@gmail.com",
          name: "Achismos TV",
          provider: "TIKTOK",
          avatarUrl: null,
        },
      ]}
    />
  );
}
