import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { and, count, desc, eq } from "drizzle-orm";

type GetOrganizationPendingInvitesParams = {
  orgSlug: string;
  pageIndex: number;
};

const PAGE_SIZE = 12;

type GetOrganizationPendingInvitesResponse = {
  pendingInvites: {
    id: string;
    email: string;
    role: string | null;
    createdAt: Date;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getOrganizationPendingInvites(
  params: GetOrganizationPendingInvitesParams,
): Promise<GetOrganizationPendingInvitesResponse> {
  const { orgSlug, pageIndex } = params;

  const filters = and(
    eq(invitationsTable.organizationSlug, orgSlug),
    eq(invitationsTable.status, "pending"),
  );

  const [pendingInvites, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: invitationsTable.id,
        email: invitationsTable.email,
        role: invitationsTable.role,
        createdAt: invitationsTable.createdAt,
      })
      .from(invitationsTable)
      .where(filters)
      // Most recently invited first — the opposite of the members list, which
      // is oldest first.
      .orderBy(desc(invitationsTable.createdAt), desc(invitationsTable.id))
      .limit(PAGE_SIZE)
      .offset(pageIndex * PAGE_SIZE),

    db.select({ totalCount: count() }).from(invitationsTable).where(filters),
  ]);

  return {
    pendingInvites,
    meta: {
      totalCount,
      totalPages: Math.ceil(totalCount / PAGE_SIZE),
    },
  };
}
