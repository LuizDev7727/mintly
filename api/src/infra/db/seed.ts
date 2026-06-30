import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { accountsTable } from "@/infra/db/tables/accounts.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { createSlug } from "@/lib/create-slug.ts";

async function seedUser() {
  console.log("Seeding user");

  const E2E_USER = {
    name: "Test User",
    email: "testuser@gmail.com",
    passwordHash:
      "276d0e2dc4521ffbfa6062fd166c71ba:b6f0463e3b3952a8e5bc848fa2a6bd16030c2d66016c01a90f9b93c8ef7f0358404797aa9bec24728d18b070dc4ee6bc4f8044ec376e47fbd222d91bc55d43a9",
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
      slug: createSlug(E2E_USER.name),
    })
    .returning({ id: organizationsTable.id });

  await db.insert(membersTable).values({
    organizationId: organization.id,
    userId: user.id,
    role: "owner",
    createdAt: new Date(),
  });
}

async function seed() {
  await seedUser();
}

seed().then(() => {
  console.log("Database seeded!");
});
