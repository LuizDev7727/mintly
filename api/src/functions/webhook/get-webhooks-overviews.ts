import { db } from "@/infra/db/client.ts"
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts"
import { webhookLogsTable } from "@/infra/db/tables/webhook-log.table.ts"
import {
  webhooksTable,
  type WebhookEventTrigger,
} from "@/infra/db/tables/webhooks.table.ts"
import { decrypt } from "@/utils/crypto/decrypt.ts"
import { and, desc, eq, sql } from "drizzle-orm"

type GetWebhooksOverviewsParams = {
  orgSlug: string
}

type Metric = {
  value: number
  trend: number
  sparkline: number[]
}

type WebhookLogStatus = "PENDING" | "SUCCESS" | "FAILED"

type RecentDelivery = {
  id: string
  url: string
  status: WebhookLogStatus
  method: string
  pathname: string
  ip: string
  statusCode: number
  contentType: string | null
  contentLength: number | null
  queryParams: Record<string, string> | null
  headers: Record<string, string>
  body: string | null
  createdAt: Date
}

type WebhookSummary = {
  id: string
  url: string
  triggers: WebhookEventTrigger[]
  signingSecret: string
  createdAt: Date
  lastLog: {
    status: WebhookLogStatus
    createdAt: Date
  } | null
}

type GetWebhooksOverviewsResponse = {
  metrics: {
    totalDeliveries: Metric
    successful: Metric
    failed: Metric
    pending: Metric
    retryRate: Metric
  }
  recentDeliveries: RecentDelivery[]
  webhooks: WebhookSummary[]
  apiKey: string | null
}

function buildTrend(today: number, yesterday: number): number {
  return yesterday > 0
    ? Math.round(((today - yesterday) / yesterday) * 100)
    : 0
}

export async function getWebhooksOverviews(
  params: GetWebhooksOverviewsParams,
): Promise<GetWebhooksOverviewsResponse> {
  const { orgSlug } = params

  const now = new Date()
  const oneDayAgo = new Date(now)
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  // One row per calendar day in the last 7 days, so the sparkline always has
  // 7 points even for days without any deliveries.
  const dateSeries = db.$with("date_series").as(
    db
      .select({
        date: sql<string>`TO_CHAR(t.day, 'YYYY-MM-DD')`.as("date"),
      })
      .from(
        sql`generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') as t(day)`,
      ),
  )

  const logsPerDay = db.$with("logs_per_day").as(
    db
      .select({
        logDate: sql<string>`TO_CHAR(${webhookLogsTable.createdAt}, 'YYYY-MM-DD')`.as(
          "log_date",
        ),
        total: sql<number>`count(*)::int`.as("total"),
        successful: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'SUCCESS')::int`.as(
          "successful",
        ),
        failed: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'FAILED')::int`.as(
          "failed",
        ),
        pending: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'PENDING')::int`.as(
          "pending",
        ),
        retried: sql<number>`count(*) filter (where ${webhookLogsTable.numberOfRetries} > 0)::int`.as(
          "retried",
        ),
      })
      .from(webhookLogsTable)
      .innerJoin(webhooksTable, eq(webhookLogsTable.webhookId, webhooksTable.id))
      .where(
        and(
          eq(webhooksTable.organizationSlug, orgSlug),
          sql`${webhookLogsTable.createdAt} >= CURRENT_DATE - INTERVAL '6 days'`,
        ),
      )
      .groupBy(sql`TO_CHAR(${webhookLogsTable.createdAt}, 'YYYY-MM-DD')`),
  )

  // Most recent log per webhook, used to show each webhook's last delivery
  // status without an N+1 query per webhook.
  const latestLogPerWebhook = db.$with("latest_log_per_webhook").as(
    db
      .selectDistinctOn([webhookLogsTable.webhookId], {
        webhookId: webhookLogsTable.webhookId,
        status: webhookLogsTable.status,
        createdAt: webhookLogsTable.createdAt,
      })
      .from(webhookLogsTable)
      .orderBy(webhookLogsTable.webhookId, desc(webhookLogsTable.createdAt)),
  )

  const [[totals], [sparklines], recentDeliveries, webhooks, [organization]] =
    await Promise.all([
      db
        .select({
          totalToday: sql<number>`count(*) filter (where ${webhookLogsTable.createdAt} >= ${oneDayAgo})::int`,
          totalYesterday: sql<number>`count(*) filter (where ${webhookLogsTable.createdAt} >= ${twoDaysAgo} and ${webhookLogsTable.createdAt} < ${oneDayAgo})::int`,
          successfulToday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'SUCCESS' and ${webhookLogsTable.createdAt} >= ${oneDayAgo})::int`,
          successfulYesterday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'SUCCESS' and ${webhookLogsTable.createdAt} >= ${twoDaysAgo} and ${webhookLogsTable.createdAt} < ${oneDayAgo})::int`,
          failedToday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'FAILED' and ${webhookLogsTable.createdAt} >= ${oneDayAgo})::int`,
          failedYesterday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'FAILED' and ${webhookLogsTable.createdAt} >= ${twoDaysAgo} and ${webhookLogsTable.createdAt} < ${oneDayAgo})::int`,
          pendingToday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'PENDING' and ${webhookLogsTable.createdAt} >= ${oneDayAgo})::int`,
          pendingYesterday: sql<number>`count(*) filter (where ${webhookLogsTable.status} = 'PENDING' and ${webhookLogsTable.createdAt} >= ${twoDaysAgo} and ${webhookLogsTable.createdAt} < ${oneDayAgo})::int`,
          retriedToday: sql<number>`count(*) filter (where ${webhookLogsTable.numberOfRetries} > 0 and ${webhookLogsTable.createdAt} >= ${oneDayAgo})::int`,
          retriedYesterday: sql<number>`count(*) filter (where ${webhookLogsTable.numberOfRetries} > 0 and ${webhookLogsTable.createdAt} >= ${twoDaysAgo} and ${webhookLogsTable.createdAt} < ${oneDayAgo})::int`,
        })
        .from(webhookLogsTable)
        .innerJoin(webhooksTable, eq(webhookLogsTable.webhookId, webhooksTable.id))
        .where(eq(webhooksTable.organizationSlug, orgSlug)),

      db
        .with(dateSeries, logsPerDay)
        .select({
          totalDeliveries: sql<number[]>`array_agg(coalesce(${logsPerDay.total}, 0) order by ${dateSeries.date})`,
          successful: sql<number[]>`array_agg(coalesce(${logsPerDay.successful}, 0) order by ${dateSeries.date})`,
          failed: sql<number[]>`array_agg(coalesce(${logsPerDay.failed}, 0) order by ${dateSeries.date})`,
          pending: sql<number[]>`array_agg(coalesce(${logsPerDay.pending}, 0) order by ${dateSeries.date})`,
          retryRate: sql<number[]>`array_agg(coalesce(round(${logsPerDay.retried} * 100.0 / nullif(${logsPerDay.total}, 0)), 0)::int order by ${dateSeries.date})`,
        })
        .from(dateSeries)
        .leftJoin(logsPerDay, eq(logsPerDay.logDate, dateSeries.date)),

      // Last 5 deliveries (any status) across all of the org's webhooks.
      db
        .select({
          id: webhookLogsTable.id,
          url: webhookLogsTable.url,
          status: webhookLogsTable.status,
          method: webhookLogsTable.method,
          pathname: webhookLogsTable.pathname,
          ip: webhookLogsTable.ip,
          statusCode: webhookLogsTable.statusCode,
          contentType: webhookLogsTable.contentType,
          contentLength: webhookLogsTable.contentLength,
          queryParams: webhookLogsTable.queryParams,
          headers: webhookLogsTable.headers,
          body: webhookLogsTable.body,
          createdAt: webhookLogsTable.createdAt,
        })
        .from(webhookLogsTable)
        .innerJoin(webhooksTable, eq(webhookLogsTable.webhookId, webhooksTable.id))
        .where(eq(webhooksTable.organizationSlug, orgSlug))
        .orderBy(desc(webhookLogsTable.createdAt))
        .limit(5),

      // Last 5 webhooks created, each with its most recent delivery status.
      db
        .with(latestLogPerWebhook)
        .select({
          id: webhooksTable.id,
          url: webhooksTable.url,
          triggers: webhooksTable.triggers,
          signingSecret: webhooksTable.signingKey,
          createdAt: webhooksTable.createdAt,
          lastLogStatus: latestLogPerWebhook.status,
          lastLogAt: latestLogPerWebhook.createdAt,
        })
        .from(webhooksTable)
        .leftJoin(
          latestLogPerWebhook,
          eq(latestLogPerWebhook.webhookId, webhooksTable.id),
        )
        .where(eq(webhooksTable.organizationSlug, orgSlug))
        .orderBy(desc(webhooksTable.createdAt))
        .limit(5),

      db
        .select({ apiKey: organizationsTable.apiKey })
        .from(organizationsTable)
        .where(eq(organizationsTable.slug, orgSlug))
        .limit(1),
    ])

  let apiKey: string | null = null
  if (organization?.apiKey) {
    try {
      apiKey = await decrypt(
        organization.apiKey.ciphertext,
        organization.apiKey.iv,
      )
    } catch {
      apiKey = null
    }
  }

  const retryRateToday =
    totals.totalToday > 0
      ? Math.round((totals.retriedToday / totals.totalToday) * 100)
      : 0
  const retryRateYesterday =
    totals.totalYesterday > 0
      ? Math.round((totals.retriedYesterday / totals.totalYesterday) * 100)
      : 0

  return {
    metrics: {
      totalDeliveries: {
        value: totals.totalToday,
        trend: buildTrend(totals.totalToday, totals.totalYesterday),
        sparkline: sparklines.totalDeliveries,
      },
      successful: {
        value: totals.successfulToday,
        trend: buildTrend(totals.successfulToday, totals.successfulYesterday),
        sparkline: sparklines.successful,
      },
      failed: {
        value: totals.failedToday,
        trend: buildTrend(totals.failedToday, totals.failedYesterday),
        sparkline: sparklines.failed,
      },
      pending: {
        value: totals.pendingToday,
        trend: buildTrend(totals.pendingToday, totals.pendingYesterday),
        sparkline: sparklines.pending,
      },
      retryRate: {
        value: retryRateToday,
        trend: buildTrend(retryRateToday, retryRateYesterday),
        sparkline: sparklines.retryRate,
      },
    },
    recentDeliveries: recentDeliveries.map((delivery) => ({
      id: delivery.id,
      url: delivery.url,
      status: delivery.status,
      method: delivery.method,
      pathname: delivery.pathname,
      ip: delivery.ip,
      statusCode: delivery.statusCode,
      contentType: delivery.contentType,
      contentLength: delivery.contentLength,
      queryParams: delivery.queryParams,
      headers: delivery.headers,
      body: delivery.body,
      createdAt: delivery.createdAt,
    })),
    webhooks: webhooks.map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      triggers: webhook.triggers,
      signingSecret: webhook.signingSecret,
      createdAt: webhook.createdAt,
      lastLog: webhook.lastLogStatus
        ? { status: webhook.lastLogStatus, createdAt: webhook.lastLogAt! }
        : null,
    })),
    apiKey,
  }
}
