import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { eq } from "drizzle-orm";

type CreateInviteMemberParams = {
  orgSlug: string;
  email: string;
  inviterId: string;
};

type CreateInviteMemberResponse = {
  inviteId: string;
};

const INVITE_EXPIRES_IN_DAYS = 7;

export async function createInviteMember(
  params: CreateInviteMemberParams,
): Promise<CreateInviteMemberResponse> {
  const { orgSlug, email, inviterId } = params;

  const [{ organizationSlug }] = await db
    .select({ organizationSlug: organizationsTable.slug })
    .from(organizationsTable)
    .where(eq(organizationsTable.slug, orgSlug));

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRES_IN_DAYS);

  const [{ inviteId }] = await db
    .insert(invitationsTable)
    .values({
      organizationSlug,
      email,
      expiresAt,
      inviterId,
    })
    .returning({ inviteId: invitationsTable.id });

  return { inviteId };
}
