import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { getMembersHttp } from "@/http/organization/get-members.http";
import { MemberCard } from "./member-card";
import { MembersPagination } from "./members-pagination";

export function MembersList() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const [currentPage] = useQueryState(
    "members_page",
    parseAsInteger.withDefault(0),
  );

  // useSuspenseQuery re-suspends on every queryKey change (it does not accept
  // placeholderData), so changing pages shows the Suspense fallback again —
  // see MembersListSkeleton, rendered by the boundary in members-tabs.tsx.
  const { data } = useSuspenseQuery({
    queryKey: ["members", slug, "page", currentPage],
    queryFn: () => getMembersHttp({ orgSlug: slug, pageIndex: currentPage }),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      <MembersPagination
        totalPages={data.meta.totalPages}
        totalCount={data.meta.totalCount}
      />
    </div>
  );
}
