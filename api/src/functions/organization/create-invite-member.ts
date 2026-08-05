import { db } from "@/infra/db/client.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { resend } from "@/lib/resend.ts";
import InviteMemberTemplate from "@/utils/resend/templates/invite-member-template.tsx";
import { eq } from "drizzle-orm";

type CreateInviteMemberParams = {
  orgSlug: string;
  email: string;
  inviter: {
    id: string
    name: string
  }
};

type CreateInviteMemberResponse = {
  inviteId: string;
};

const INVITE_EXPIRES_IN_DAYS = 7;

export async function createInviteMember(
  params: CreateInviteMemberParams,
): Promise<CreateInviteMemberResponse> {
  const { orgSlug, email, inviter } = params;

  const [{ organizationSlug, organizationName }] = await db
    .select({ organizationSlug: organizationsTable.slug, organizationName: organizationsTable.name })
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
      inviterId: inviter.id,
    })
    .returning({ inviteId: invitationsTable.id });

  await resend.emails.send({
    from: "luiz.antonioq2003@gmail.com",
    to: "luiz.antonio999@hotmail.com",
    react: InviteMemberTemplate({ inviter, organization: { name: organizationName } }),
    subject: "",
  })

  return { inviteId };
}
