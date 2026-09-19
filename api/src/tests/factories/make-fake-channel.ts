import { faker } from "@faker-js/faker";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import type { Replace } from "./replace.ts";
import { db } from "@/infra/db/client.ts";

type ChannelProps = typeof channelsTable.$inferInsert;

type Overrides = Partial<Replace<ChannelProps, {}>>;

export async function makeFakeChannel(
  organizationSlug: string,
  data = {} as Overrides,
) {
  const name = data.name || faker.word.noun();
  const slug = data.slug || `${faker.helpers.slugify(name).toLowerCase()}-${faker.string.alphanumeric(6).toLowerCase()}`;
  const description = data.description || faker.lorem.sentence();

  const [{ channelId }] = await db
    .insert(channelsTable)
    .values({ name, slug, description, organizationSlug })
    .returning({ channelId: channelsTable.id });

  return { channelId };
}
