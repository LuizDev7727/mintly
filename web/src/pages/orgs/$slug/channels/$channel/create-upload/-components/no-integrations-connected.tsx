import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Link, useParams } from "@tanstack/react-router";
import { Unplug } from "lucide-react";

export function NoIntegrationsConnected() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Unplug />
        </EmptyMedia>
        <EmptyTitle>No integrations connected</EmptyTitle>
        <EmptyDescription>
          You need to connect your channel to a YouTube or TikTok account before
          you can create a post.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild size="sm">
          <Link
            to="/orgs/$slug/channels/$channel/integrations"
            params={{ slug, channel }}
          >
            Connect an account
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
