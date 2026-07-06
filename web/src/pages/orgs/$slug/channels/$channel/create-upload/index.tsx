import { createFileRoute, useParams } from "@tanstack/react-router";
import { CreatePostForm } from "./-components/create-post-form";
import { useQuery } from "@tanstack/react-query";
import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import { NoIntegrationsConnected } from "./-components/no-integrations-connected";

export const Route = createFileRoute(
  "/orgs/$slug/channels/$channel/create-upload/",
)({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Create a new post for your channel",
      },
      { title: "Create Post | Mintly" },
    ],
  }),
  component: CreateUploadPage,
});

function CreateUploadPage() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["integrations", slug, channel],
    queryFn: () =>
      getIntegrationsHttp({
        channelId: channel,
      }),
  });

  if (isLoading || !data) {
    return null;
  }

  const { integrations } = data;

  const isIntegrationsEmpty = integrations.length === 0;

  if (isIntegrationsEmpty) {
    return <NoIntegrationsConnected />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Post</h1>
        <p className="text-sm text-muted-foreground">
          Upload a video or image to create a new post for your channel
        </p>
      </div>
      <CreatePostForm integrations={integrations} />
    </div>
  );
}
