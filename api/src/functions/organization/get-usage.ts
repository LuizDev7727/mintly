import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { getOrganizationCogs } from "@/functions/organization/get-organization-cogs.ts";
import { and, eq, sql } from "drizzle-orm";
import { polar } from "@/lib/polar.ts";

type UsageEventName =
  | "best_moments_generated"
  | "clip_rendered"
  | "thumbnail_generated"
  | "seo_generated"
  | "audio_transcribed";

type GetUsageParams = {
  organizationSlug: string;
  startDate: Date;
  endDate: Date;
};

type UsageByDate = {
  date: string;
  clipRendered: number;
  thumbnailGenerated: number;
  seoGenerated: number;
  audioTranscribed: number;
  bestMomentsGenerated: number;
};

type PeriodComparison = {
  currentCents: number;
  previousCents: number;
  changePercentage: number;
};

type StorageComparison = {
  currentBytes: number;
  previousBytes: number;
  changePercentage: number;
};

type StorageByDate = {
  date: string;
  storage: number;
};

type GetUsageResponse = {
  costs: PeriodComparison;
  storage: StorageComparison;
  series: UsageByDate[];
  storageSeries: StorageByDate[];
};

const EVENT_NAME_TO_SERIES_KEY: Record<
  UsageEventName,
  keyof Omit<UsageByDate, "date">
> = {
  best_moments_generated: "bestMomentsGenerated",
  clip_rendered: "clipRendered",
  thumbnail_generated: "thumbnailGenerated",
  seo_generated: "seoGenerated",
  audio_transcribed: "audioTranscribed",
};

function calculateChangePercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

async function getUsageEvents({
  organizationSlug,
  startDate,
  endDate,
}: GetUsageParams) {
  const events = [];
  let page = 1;

  while (true) {
    const { items, pagination } = await polar.events.list({
      externalCustomerId: organizationSlug,
      name: Object.keys(EVENT_NAME_TO_SERIES_KEY),
      startTimestamp: startDate,
      endTimestamp: endDate,
      page,
      limit: 100,
    });

    events.push(...items);

    if (page >= pagination.maxPage) break;
    page++;
  }

  return events;
}

export async function getUsage({
  organizationSlug,
  startDate,
  endDate,
}: GetUsageParams): Promise<GetUsageResponse> {
  // The "Costs"/"Storage" KPIs always compare the current calendar month
  // against the previous one, independent of startDate/endDate — those two
  // only scope the two charts (series, storageSeries).
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // One row per calendar day in the requested range, so storageSeries always
  // has a point for every day even without uploads that day.
  const dateSeries = db.$with("date_series").as(
    db
      .select({
        date: sql<string>`TO_CHAR(t.day, 'YYYY-MM-DD')`.as("date"),
      })
      .from(
        sql`generate_series(${startDate}::date, ${endDate}::date, interval '1 day') as t(day)`,
      ),
  );

  const postsSizePerDay = db.$with("posts_size_per_day").as(
    db
      .select({
        postDate: sql<string>`TO_CHAR(${postsTable.createdAt}, 'YYYY-MM-DD')`.as(
          "post_date",
        ),
        totalSize: sql<number>`coalesce(sum(${postsTable.size}), 0)::int`.as(
          "total_size",
        ),
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${postsTable.createdAt} >= ${startDate} and ${postsTable.createdAt} <= ${endDate}`,
        ),
      )
      .groupBy(sql`TO_CHAR(${postsTable.createdAt}, 'YYYY-MM-DD')`),
  );

  const [
    events,
    storageRows,
    currentCogs,
    previousCogs,
    [{ totalBytes: currentStorageBytes }],
    [{ totalBytes: previousStorageBytes }],
  ] = await Promise.all([
    getUsageEvents({ organizationSlug, startDate, endDate }),
    db
      .with(dateSeries, postsSizePerDay)
      .select({
        date: dateSeries.date,
        totalSize: sql<number>`coalesce(${postsSizePerDay.totalSize}, 0)`,
      })
      .from(dateSeries)
      .leftJoin(postsSizePerDay, eq(postsSizePerDay.postDate, dateSeries.date))
      .orderBy(dateSeries.date),
    // Billing is pass-through (no markup), so COGS this month is exactly
    // what the org owes — reused here instead of re-deriving the same sum.
    getOrganizationCogs({
      organizationSlug,
      startDate: currentMonthStart,
      endDate: now,
    }),
    getOrganizationCogs({
      organizationSlug,
      startDate: previousMonthStart,
      endDate: currentMonthStart,
    }),
    db
      .select({
        totalBytes: sql<number>`coalesce(sum(${postsTable.size}), 0)::int`,
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${postsTable.createdAt} <= ${now}`,
        ),
      ),
    db
      .select({
        totalBytes: sql<number>`coalesce(sum(${postsTable.size}), 0)::int`,
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${postsTable.createdAt} <= ${currentMonthStart}`,
        ),
      ),
  ]);

  const seriesByDate = new Map<string, UsageByDate>();

  for (const event of events) {
    const seriesKey = EVENT_NAME_TO_SERIES_KEY[event.name as UsageEventName];

    if (!seriesKey) continue;

    const date = event.timestamp.toISOString().split("T")[0];

    if (!seriesByDate.has(date)) {
      seriesByDate.set(date, {
        date,
        clipRendered: 0,
        thumbnailGenerated: 0,
        seoGenerated: 0,
        audioTranscribed: 0,
        bestMomentsGenerated: 0,
      });
    }

    seriesByDate.get(date)![seriesKey] += 1;
  }

  const series = Array.from(seriesByDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Cumulative within the selected range (starts at 0 on startDate), not the
  // org's all-time total — matches the "for the selected period" chart title.
  let runningTotal = 0;
  const storageSeries = storageRows.map(({ date, totalSize }) => ({
    date,
    storage: (runningTotal += totalSize),
  }));

  return {
    costs: {
      currentCents: currentCogs.totalCents,
      previousCents: previousCogs.totalCents,
      changePercentage: calculateChangePercentage(
        currentCogs.totalCents,
        previousCogs.totalCents,
      ),
    },
    storage: {
      currentBytes: currentStorageBytes,
      previousBytes: previousStorageBytes,
      changePercentage: calculateChangePercentage(
        currentStorageBytes,
        previousStorageBytes,
      ),
    },
    series,
    storageSeries,
  };
}
