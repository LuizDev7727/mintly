import { faker } from "@faker-js/faker";
import { makeFakeInvitation } from "./make-fake-invitation.ts";

type Overrides = {
  startAt?: Date;
};

export async function makeFakeInvitations(
  organizationSlug: string,
  inviterId: string,
  amount: number,
  data = {} as Overrides,
) {
  const startAt = data.startAt || faker.date.past();

  const invitationIds: string[] = [];

  for (let index = 0; index < amount; index++) {
    // One second apart, so invitations come back in exactly this order.
    const { invitationId } = await makeFakeInvitation(
      organizationSlug,
      inviterId,
      { createdAt: new Date(startAt.getTime() + index * 1000) },
    );

    invitationIds.push(invitationId);
  }

  return { invitationIds };
}
