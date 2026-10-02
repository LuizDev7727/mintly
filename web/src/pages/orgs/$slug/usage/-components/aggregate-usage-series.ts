import { format, startOfMonth, startOfWeek } from "date-fns";

export type UsageGranularity = "daily" | "weekly" | "monthly";

type UsagePoint = {
  date: string;
  clipRendered: number;
  thumbnailGenerated: number;
  seoGenerated: number;
  audioTranscribed: number;
  bestMomentsGenerated: number;
};

function getBucketDate(date: Date, granularity: UsageGranularity) {
  if (granularity === "weekly") return startOfWeek(date);
  if (granularity === "monthly") return startOfMonth(date);
  return date;
}

/** Agrupa a série diária em semanas ou meses, somando cada tipo de evento. */
export function aggregateUsageSeries(
  series: UsagePoint[],
  granularity: UsageGranularity,
) {
  if (granularity === "daily") return series;

  const buckets = new Map<string, UsagePoint>();

  for (const point of series) {
    const bucketKey = format(
      getBucketDate(new Date(point.date), granularity),
      "yyyy-MM-dd",
    );
    const bucket = buckets.get(bucketKey) ?? {
      date: bucketKey,
      clipRendered: 0,
      thumbnailGenerated: 0,
      seoGenerated: 0,
      audioTranscribed: 0,
      bestMomentsGenerated: 0,
    };

    bucket.clipRendered += point.clipRendered;
    bucket.thumbnailGenerated += point.thumbnailGenerated;
    bucket.seoGenerated += point.seoGenerated;
    bucket.audioTranscribed += point.audioTranscribed;
    bucket.bestMomentsGenerated += point.bestMomentsGenerated;
    buckets.set(bucketKey, bucket);
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
