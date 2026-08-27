import { db } from "@/infra/db/client.ts";
import { activitiesTable } from "@/infra/db/tables/activities.table.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { webhooksTable } from "@/infra/db/tables/webhooks.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, count, desc, eq, sql } from "drizzle-orm";

type GetOverviewProps = {
  orgSlug: string;
};

type GetOverviewResponse = {
  overview: {
    channelsCount: number,
    membersCount: number,
    usage: {
      totalUsage: number;
      series: number[]
    },
    storage: {
      totalStorage: number;
      series: number[]
    },
    channels: {
      id: string,
      name: string;
      totalPosts: number
    }[],
    recentActivities: {
      action: string;
      description: string;
      createdAt: string;
      author: {
        name: string;
        avatarUrl: string | null;
      }
    }[],
    webhooks: {
      id: string;
      url: string
    }[]
  }
};

export async function getOverview({ orgSlug }: GetOverviewProps): Promise<GetOverviewResponse> {

  // One row per calendar day in the last 30 days, so the storage series
  // always has 30 points even for days without any uploads.
  const dateSeries = db.$with("date_series").as(
    db
      .select({
        date: sql<string>`TO_CHAR(t.day, 'YYYY-MM-DD')`.as("date"),
      })
      .from(
        sql`generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') as t(day)`,
      ),
  );

  const postsSizePerDay = db.$with("posts_size_per_day").as(
    db
      .select({
        postDate: sql<string>`TO_CHAR(${postsTable.createdAt}, 'YYYY-MM-DD')`.as("post_date"),
        totalSize: sql<number>`coalesce(sum(${postsTable.size}), 0)::int`.as("total_size"),
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, orgSlug),
          sql`${postsTable.createdAt} >= CURRENT_DATE - INTERVAL '29 days'`,
        ),
      )
      .groupBy(sql`TO_CHAR(${postsTable.createdAt}, 'YYYY-MM-DD')`),
  );

  const [
    [{ channelsCount }],
    [{ membersCount }],
    channels,
    recentActivitiesResult,
    webhooks,
    [{ totalStorage }],
    [{ series: storageSeries }],
  ] = await Promise.all([
    db
      .select({ channelsCount: count() })
      .from(channelsTable)
      .where(eq(channelsTable.organizationSlug, orgSlug)),
    db
      .select({ membersCount: count() })
      .from(membersTable)
      .where(eq(membersTable.organizationSlug, orgSlug)),
    db
      .select({
        id: channelsTable.id,
        name: channelsTable.name,
        totalPosts: count(postsTable.id),
      })
      .from(channelsTable)
      .leftJoin(postsTable, eq(postsTable.channelId, channelsTable.id))
      .where(eq(channelsTable.organizationSlug, orgSlug))
      .groupBy(channelsTable.id),
    db
      .select({
        action: activitiesTable.action,
        description: activitiesTable.description,
        createdAt: activitiesTable.createdAt,
        author: {
          name: usersTable.name,
          avatarUrl: usersTable.image,
        },
      })
      .from(activitiesTable)
      .innerJoin(usersTable, eq(activitiesTable.authorId, usersTable.id))
      .where(eq(activitiesTable.organizationSlug, orgSlug))
      .orderBy(desc(activitiesTable.id))
      .limit(3),
    db
      .select({
        id: webhooksTable.id,
        url: webhooksTable.url,
      })
      .from(webhooksTable)
      .where(eq(webhooksTable.organizationSlug, orgSlug))
      .orderBy(desc(webhooksTable.createdAt)),
    db
      .select({
        totalStorage: sql<number>`coalesce(sum(${postsTable.size}), 0)::int`,
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(eq(channelsTable.organizationSlug, orgSlug)),
    db
      .with(dateSeries, postsSizePerDay)
      .select({
        series: sql<number[]>`
          array_agg(
            coalesce(${postsSizePerDay.totalSize}, 0)
            order by ${dateSeries.date}
          )
        `,
      })
      .from(dateSeries)
      .leftJoin(postsSizePerDay, eq(postsSizePerDay.postDate, dateSeries.date)),
  ]);

  const recentActivities = await Promise.all(
    recentActivitiesResult.map(async (activity) => ({
      ...activity,
      createdAt: activity.createdAt.toISOString(),
      author: {
        name: activity.author.name,
        avatarUrl: activity.author.avatarUrl
          ? await generateSignedUrl({ key: activity.author.avatarUrl })
          : null,
      },
    })),
  );

  return {
    overview: {
      channels,
      channelsCount,
      membersCount,
      storage: {
        series: storageSeries,
        totalStorage,
      },
      usage: {
        totalUsage: 0,
        series: [],
      },
      recentActivities,
      webhooks,
    }
  };
}
