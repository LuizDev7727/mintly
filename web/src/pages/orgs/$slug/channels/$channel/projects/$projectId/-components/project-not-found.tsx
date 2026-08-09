import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { ArrowLeft, FolderX } from "lucide-react";

export function ProjectNotFound() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel"
  });

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-11 items-center justify-center rounded-full border bg-background">
        <FolderX className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">Project not found</p>
        <p className="text-muted-foreground text-sm">
          It may have been deleted, or you don't have access to it.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link
          to="/orgs/$slug/channels/$channel/projects"
          params={{ slug, channel }}
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
      </Button>
    </div>
  );
}
