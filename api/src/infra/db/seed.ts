import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { accountsTable } from "@/infra/db/tables/accounts.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { createSlug } from "@/lib/create-slug.ts";
import { channelsTable } from "./tables/channels.table.ts";

async function seedUser() {
  console.log("Seeding user");

  const E2E_USER = {
    name: "Test User",
    email: "testuser@gmail.com",
    passwordHash:
      "f0619de6cc40b8ee17159d74e23cbc7e:2387e584bb5a6b504c961fed196f7eb4ee11d5edcef749a71b1166c0ee0e6dc98534a4c60760826ae6298087d4ebcc9615b311ba3b6b0eb4d0a71446c61b1779", //DwayneJ781@
  };

  const [user] = await db
    .insert(usersTable)
    .values({
      name: E2E_USER.name,
      email: E2E_USER.email,
      emailVerified: true,
    })
    .returning({ id: usersTable.id });

  await db.insert(accountsTable).values({
    accountId: user.id,
    providerId: "credential",
    userId: user.id,
    password: E2E_USER.passwordHash,
  });

  const [organization] = await db
    .insert(organizationsTable)
    .values({
      name: E2E_USER.name,
      ownerId: user.id,
      slug: createSlug(E2E_USER.name),
    })
    .returning({ id: organizationsTable.id, slug: organizationsTable.slug });

  await db.insert(membersTable).values({
    organizationSlug: organization.slug,
    userId: user.id,
    role: "owner",
    createdAt: new Date(),
  });

  const channelName = "My New Channel";
  await db.insert(channelsTable).values({
    id: "019f1b80-42cf-79bb-b828-1cff43be9900",
    name: channelName,
    slug: createSlug(channelName),
    organizationSlug: organization.slug,
    createdAt: new Date(),
  });
}

async function seed() {
  await seedUser();
}

seed().then(() => {
  console.log("Database seeded!");
});
