import { Link, useParams } from "@tanstack/react-router";
import { Package } from "lucide-react";

type ProjectCardProps = {
  avatarUrl: string | null;
  title: string;
  slug: string;
  postsCount: number;
  integrationsCount: number;
};

export function ProjectCard(props: ProjectCardProps) {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { title, postsCount, integrationsCount, slug: projectSlug } = props;

  return (
    <Link
      to={"/orgs/$slug/projects/$project"}
      params={{ slug, project: projectSlug }}
      className="w-full hover:bg-zinc-900/20 cursor-pointer rounded-sm border"
    >
      <header className="p-4 flex items-center gap-x-2">
        <div className="flex items-center justify-between gap-x-2 border p-2 rounded-sm">
          <Package />
        </div>
        <div>
          <h1>{title}</h1>
          <p className="text-muted-foreground text-xs">
            {postsCount} Posts - {integrationsCount} Integrations
          </p>
        </div>
      </header>
    </Link>
  );
}
