import { faker } from "@faker-js/faker";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import type { Replace } from "./replace.ts";
import { db } from "@/infra/db/client.ts";

type InvitationProps = typeof invitationsTable.$inferInsert;

type Overrides = Partial<
  Replace<
    InvitationProps,
    {
      role?: string;
      createdAt?: Date;
    }
  >
>;

export async function makeFakeInvitation(
  organizationSlug: string,
  inviterId: string,
  data = {} as Overrides,
) {
  const email = data.email || faker.internet.email();
  const role = data.role || "member";
  const createdAt = data.createdAt || faker.date.past();
  const expiresAt = data.expiresAt || faker.date.future();
  const status = data.status || "pending";

  const [invitation] = await db
    .insert(invitationsTable)
    .values({
      organizationSlug,
      email,
      role,
      status,
      createdAt,
      expiresAt,
      inviterId,
    })
    .returning({ id: invitationsTable.id });

  return { invitationId: invitation.id };
}
