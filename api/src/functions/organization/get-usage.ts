import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { and, eq, sql } from "drizzle-orm";

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

const MOCK_COSTS: PeriodComparison = {
  currentCents: 12450,
  previousCents: 9800,
  changePercentage: 27.04,
};

function calculateChangePercentage(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return ((current - previous) / previous) * 100;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

// TODO: mockado enquanto o billing via Polar está fora do ar. Gera uma série
// determinística (uma onda por tipo de evento) para cada dia do período.
function buildMockSeries({
  startDate,
  endDate,
}: Pick<GetUsageParams, "startDate" | "endDate">): UsageByDate[] {
  const wave = (index: number, offset: number, amplitude: number, base: number) =>
    Math.max(0, Math.round(base + amplitude * Math.sin(index / 3 + offset)));

  const series: UsageByDate[] = [];
  const firstDay = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const lastDay = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate(),
  );

  for (let day = firstDay, index = 0; day <= lastDay; day += DAY_IN_MS, index++) {
    series.push({
      date: new Date(day).toISOString().split("T")[0],
      clipRendered: wave(index, 0, 4, 6),
      thumbnailGenerated: wave(index, 1, 3, 4),
      seoGenerated: wave(index, 2, 2, 3),
      audioTranscribed: wave(index, 3, 3, 5),
      bestMomentsGenerated: wave(index, 4, 2, 3),
    });
  }

  return series;
}

export async function getUsage({
  organizationSlug,
  startDate,
  endDate,
}: GetUsageParams): Promise<GetUsageResponse> {
  // The "Storage" KPI always compares the current calendar month against the
  // previous one, independent of startDate/endDate — those two only scope the
  // two charts (series, storageSeries).
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

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
    storageRows,
    [{ totalBytes: currentStorageBytes }],
    [{ totalBytes: previousStorageBytes }],
  ] = await Promise.all([
    db
      .with(dateSeries, postsSizePerDay)
      .select({
        date: dateSeries.date,
        totalSize: sql<number>`coalesce(${postsSizePerDay.totalSize}, 0)`,
      })
      .from(dateSeries)
      .leftJoin(postsSizePerDay, eq(postsSizePerDay.postDate, dateSeries.date))
      .orderBy(dateSeries.date),
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

  const series = buildMockSeries({ startDate, endDate });

  // Cumulative within the selected range (starts at 0 on startDate), not the
  // org's all-time total — matches the "for the selected period" chart title.
  let runningTotal = 0;
  const storageSeries = storageRows.map(({ date, totalSize }) => ({
    date,
    storage: (runningTotal += totalSize),
  }));

  return {
    // TODO: mockado enquanto o billing via Polar está fora do ar.
    costs: MOCK_COSTS,
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
