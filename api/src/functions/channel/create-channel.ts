import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { createSlug } from "@/lib/create-slug.ts";
import { and, eq } from "drizzle-orm";
import { ChannelAlreadyExistsError } from "../../errors/channel-already-exists.error.ts";

type CreateChannelParams = {
  orgSlug: string;
  name: string;
};

type CreateChannelResponse = {
  channelId: string;
};

export async function createChannel(
  params: CreateChannelParams,
): Promise<CreateChannelResponse> {
  const { orgSlug, name } = params;

  const [hasSameChannelRegistred] = await db
    .select()
    .from(channelsTable)
    .where(
      and(
        eq(channelsTable.slug, createSlug(name)),
        eq(channelsTable.organizationSlug, orgSlug),
      ),
    )
    .limit(1);

  if (hasSameChannelRegistred) {
    throw new ChannelAlreadyExistsError();
  }

  const [{ channelId }] = await db
    .insert(channelsTable)
    .values({ name, slug: createSlug(name), organizationSlug: orgSlug })
    .returning({ channelId: channelsTable.id });

  return { channelId };
}
