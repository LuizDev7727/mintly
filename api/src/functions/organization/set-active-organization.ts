import { db } from "@/infra/db/client.ts";
import { sessionsTable } from "@/infra/db/tables/sessions.table.ts";
import { eq } from "drizzle-orm";

type SetActiveOrganizationParams = {
  organizationSlug: string;
  sessionId: string;
};

export async function setActiveOrganization(
  params: SetActiveOrganizationParams,
) {
  const { organizationSlug, sessionId } = params;
  await db
    .update(sessionsTable)
    .set({ activeOrganizationId: organizationSlug })
    .where(eq(sessionsTable.id, sessionId));
}
