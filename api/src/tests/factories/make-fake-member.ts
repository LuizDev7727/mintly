import { faker } from "@faker-js/faker";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import type { Replace } from "./replace.ts";
import { db } from "@/infra/db/client.ts";

type MemberProps = typeof membersTable.$inferInsert;

type Overrides = Partial<
  Replace<
    MemberProps,
    {
      role?: string;
      createdAt?: Date;
    }
  >
>;

export async function makeFakeMember(
  organizationSlug: string,
  userId: string,
  data = {} as Overrides,
) {
  const role = faker.helpers.arrayElement(["member", "admin", "owner"]);
  const createdAt = faker.date.past();

  const [member] = await db
    .insert(membersTable)
    .values({
      organizationSlug,
      userId,
      role: data.role || role,
      createdAt: data.createdAt || createdAt,
    })
    .returning({ id: membersTable.id });

  return {
    memberId: member.id,
  };
}
