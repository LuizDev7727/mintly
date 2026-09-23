import { faker } from "@faker-js/faker";
import { db } from "@/infra/db/client.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import type { Replace } from "./replace.ts";

type UserProps = typeof usersTable.$inferInsert;

type Overrides = Partial<Replace<UserProps, {}>>;

// Inserts straight into the table on purpose. Creating a user through
// better-auth also creates a customer in Polar (a network call to an external
// service, slow and validated against real e-mail rules), which tests must not do.
export async function makeFakeUser(data = {} as Overrides) {
  const name = data.name || faker.person.fullName();
  const email = data.email || `${faker.string.uuid()}@example.com`;

  const [{ userId }] = await db
    .insert(usersTable)
    .values({ name, email, emailVerified: true })
    .returning({ userId: usersTable.id });

  return { userId };
}
