import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { count, eq } from "drizzle-orm";

type GetMetricsProps = {
  orgSlug: string;
};

export async function getMetrics({ orgSlug }: GetMetricsProps) {
  const [[{ totalChannels }], [{ totalMembers }]] = await Promise.all([
    db
      .select({ totalChannels: count() })
      .from(channelsTable)
      .where(eq(channelsTable.organizationSlug, orgSlug)),
    db
      .select({ totalMembers: count() })
      .from(membersTable)
      .where(eq(membersTable.organizationSlug, orgSlug)),
  ]);

  return {
    metrics: {
      totalChannels,
      totalMembers,
      totalUsage: 20,
    },
  };
}
