import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { sessionsTable } from "@/infra/db/tables/sessions.table.ts";

type SetActiveOrganizationParams = {
  organizationSlug: string;
  sessionId: string;
};

export async function setActiveOrganization(params: SetActiveOrganizationParams) {
  const { organizationSlug, sessionId } = params;
  await db
    .update(sessionsTable)
    .set({ activeOrganizationId: organizationSlug })
    .where(eq(sessionsTable.id, sessionId));
}
