import { UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useSidebar } from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function CreateUploadButtonRedirect() {
  const { open: isOpen } = useSidebar();

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild>
          <Link
            to={"/orgs/$slug/channels/$channel/create-upload"}
            params={{ slug, channel: channel }}
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
        <p>Create new post to your channel</p>
      </TooltipContent>
    </Tooltip>
  );
}
