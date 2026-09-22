import { db } from "@/infra/db/client.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { count, eq } from "drizzle-orm";

type GetMembersCountParams = {
  orgSlug: string;
};

type GetMembersCountResponse = {
  count: number;
};

export async function getMembersCount(
  params: GetMembersCountParams,
): Promise<GetMembersCountResponse> {
  const { orgSlug } = params;

  const [{ total }] = await db
    .select({ total: count() })
    .from(membersTable)
    .where(eq(membersTable.organizationSlug, orgSlug));

  return { count: total };
}
