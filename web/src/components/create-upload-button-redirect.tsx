import { UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSidebar } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function CreateUploadButtonRedirect() {
  const { open: isOpen } = useSidebar();

  const { slug, project } = useParams({
    from: "/orgs/$slug/projects/$project",
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild>
          <Link
            to={"/orgs/$slug/projects/$project/create-upload"}
            params={{ slug, project: project }}
          >
            {!isOpen ? (
              <UploadCloud className="size-4" />
            ) : (
              <>
                <UploadCloud className="size-4" /> Create Upload{" "}
              </>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Create new post to your project</p>
      </TooltipContent>
    </Tooltip>
  );
}
