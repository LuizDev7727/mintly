import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { asc, count, eq } from "drizzle-orm";

type GetMembersParams = {
  orgSlug: string;
  // When omitted, every member is returned (used by the sidebar avatars and the
  // owner filters, which need the full list). When set, only that page.
  pageIndex?: number;
};

const PAGE_SIZE = 12;

type GetMembersResponse = {
  members: {
    id: string;
    role: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
      bio: string | null;
    };
  }[],
  meta: {
    totalCount: number;
    totalPages: number;
  };
}

export async function getMembers(
  params: GetMembersParams
): Promise<GetMembersResponse> {
  const { orgSlug, pageIndex } = params;

  const membersQuery = db
    .select({
      id: membersTable.id,
      role: membersTable.role,
      createdAt: membersTable.createdAt,
      user: {
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        image: usersTable.image,
        bio: usersTable.bio,
      },
    })
    .from(membersTable)
    .innerJoin(usersTable, eq(membersTable.userId, usersTable.id))
    .where(eq(membersTable.organizationSlug, orgSlug))
    // A stable order is what keeps pages from repeating or skipping members.
    .orderBy(asc(membersTable.createdAt), asc(membersTable.id))
    .$dynamic();

  const [membersQueryResult, [{ totalCount }]] = await Promise.all([
    pageIndex === undefined
      ? membersQuery
      : membersQuery.limit(PAGE_SIZE).offset(pageIndex * PAGE_SIZE),

    db
      .select({ totalCount: count() })
      .from(membersTable)
      .where(eq(membersTable.organizationSlug, orgSlug)),
  ]);

  const members = await Promise.all(
    membersQueryResult.map(async ({ id, role, createdAt, user }) => {
      const avatarUrl = user.image
        ? await generateSignedUrl({ key: user.image })
        : null;

      return {
        id,
        role,
        createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl,
          bio: user.bio,
        },
      };
    }),
  );

  return {
    members,
    meta: {
      totalCount,
      // Without a pageIndex the whole list is one "page".
      totalPages: pageIndex === undefined ? 1 : Math.ceil(totalCount / PAGE_SIZE),
    },
  };
}
