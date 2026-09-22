import { faker } from "@faker-js/faker";
import { makeFakeMember } from "./make-fake-member.ts";
import { makeFakeUser } from "./make-fake-user.ts";

type Overrides = {
  startAt?: Date;
};

export async function makeFakeMembers(
  organizationSlug: string,
  amount: number,
  data = {} as Overrides,
) {
  const startAt = data.startAt || faker.date.past();

  const userIds: string[] = [];

  for (let index = 0; index < amount; index++) {
    const { userId } = await makeFakeUser();

    // One second apart, so members come back in exactly this order.
    await makeFakeMember(organizationSlug, userId, {
      role: "member",
      createdAt: new Date(startAt.getTime() + index * 1000),
    });

    userIds.push(userId);
  }

  return { userIds };
}
