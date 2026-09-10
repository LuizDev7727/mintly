import { db } from "@/infra/db/client.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { polar } from "@/lib/polar.ts";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { eq } from "drizzle-orm";

type EnsurePolarCustomerParams = {
  organizationSlug: string;
};

type EnsurePolarCustomerResponse = {
  polarCustomerId: string;
};

export async function ensurePolarCustomer({
  organizationSlug,
}: EnsurePolarCustomerParams): Promise<EnsurePolarCustomerResponse> {
  const [organization] = await db
    .select({
      id: organizationsTable.id,
      name: organizationsTable.name,
      billingEmail: organizationsTable.billingEmail,
      polarCustomerId: organizationsTable.polarCustomerId,
      ownerEmail: usersTable.email,
    })
    .from(organizationsTable)
    .innerJoin(usersTable, eq(organizationsTable.ownerId, usersTable.id))
    .where(eq(organizationsTable.slug, organizationSlug));

  if (!organization) {
    throw new ResourceNotFoundError(
      `Organization with slug ${organizationSlug} not found`,
    );
  }

  if (organization.polarCustomerId) {
    return { polarCustomerId: organization.polarCustomerId };
  }

  // Polar requires the customer email to be unique within our Polar account.
  // Since the same person can own multiple organizations, fall back to a
  // plus-tagged variant of the owner's email (e.g. "owner+org-slug@gmail.com")
  // instead of reusing it as-is — it still lands in their real inbox on
  // providers that support plus-addressing (Gmail, Outlook, etc.), but is
  // unique per organization from Polar's point of view.
  const [ownerEmailLocalPart, ownerEmailDomain] =
    organization.ownerEmail.split("@");
  const ownerEmailWithPlusTag = `${ownerEmailLocalPart}+${organizationSlug}@${ownerEmailDomain}`;

  const email = organization.billingEmail || ownerEmailWithPlusTag;

  const customer = await polar.customers.create({
    externalId: organizationSlug,
    name: organization.name,
    email,
  });

  await db
    .update(organizationsTable)
    .set({ polarCustomerId: customer.id })
    .where(
      eq(organizationsTable.id, organization.id),
    );

  return { polarCustomerId: customer.id };
}
