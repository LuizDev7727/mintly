import { HomeIcon, Video } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, useParams } from "@tanstack/react-router";

export function NavigationBreadcrumb() {

  const { slug } = useParams({
    from: "/orgs/$slug"
  })

  const { pathname } = useLocation()

  const paths = pathname.split("/")

  const isChannelSet = paths.length >= 5;

  const pageName = isChannelSet && paths[paths.length - 1] || "My Posts"


  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink className="inline-flex items-center gap-1.5" href={`/orgs/${slug}`}>
            <HomeIcon aria-hidden="true" size={16} />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink className="inline-flex items-center gap-1.5">
            <Video aria-hidden="true" size={16} />
            {pageName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
