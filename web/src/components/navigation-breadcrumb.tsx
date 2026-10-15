import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { useMatches } from "@tanstack/react-router";

export function NavigationBreadcrumb() {

  const pageTitle = useMatches({
    select: (matches) => {
      const title = matches
        .flatMap((match) => match.meta ?? [])
        .findLast((meta) => meta && "title" in meta)?.title

      return title?.replace(/\s*\|\s*Mintly$/, "")
    },
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="inline-flex items-center gap-1.5">
            {/*<Video aria-hidden="true" size={16} />*/}
            {pageTitle ?? "My Posts"}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
