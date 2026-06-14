import { UploadCloud } from "lucide-react";
import { Button } from "./ui/button";
import { useParams } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function CreateUploadButtonRedirect() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { project } = useParams({
    strict: false,
  });

  const isNoProjectSet = !project;

  return (
    <>
      {isNoProjectSet ? (
        <Button disabled={true}>Create Upload</Button>
      ) : (
        <Button asChild>
          <Link
            to={`/orgs/$slug/projects/$project/create-upload`}
            params={{ slug, project: project }}
          >
            <UploadCloud className="size-4" />
            Create Upload
          </Link>
        </Button>
      )}
    </>
  );
}
