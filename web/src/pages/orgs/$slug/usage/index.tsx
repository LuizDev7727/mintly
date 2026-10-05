import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  HardDrive,
} from "lucide-react";
import { useMemo, useState } from "react";
import { format, startOfDay, subDays, subMonths, subWeeks } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StorageChart } from "./-components/storage-chart";
import {
  aggregateUsageSeries,
  type UsageGranularity,
} from "./-components/aggregate-usage-series";
import { CostsChart } from "./-components/costs-chart";
import { UsageGranularityToggle } from "./-components/usage-granularity-toggle";
import { StorageChartEmpty } from "./-components/storage-chart-empty";
import { BillingEmailForm } from "./-components/billing-email-form";
import { InvoiceHistory } from "./-components/invoice-history";
import { PaymentCardSection } from "./-components/payment-card-section";
import { useQuery } from "@tanstack/react-query";
import { getUsageHttp } from "@/http/organization/get-usage.http";
import { formatBytes } from "@/utils/format-bytes";

export const Route = createFileRoute("/orgs/$slug/usage/")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Billing and usage for your organization",
      },
      { title: "Billing & Usage | Mintly" },
    ],
  }),
  component: OrgUsagePage,
});

// TODO: remover — série fictícia (contagem de eventos por dia) só para visualizar o gráfico.
const USE_MOCK_USAGE = true;

const MOCK_USAGE_SERIES = Array.from({ length: 365 }, (_, index) => {
  const date = format(subDays(new Date(), 364 - index), "yyyy-MM-dd");
  const wave = (offset: number, amplitude: number, base: number) =>
    Math.max(0, Math.round(base + amplitude * Math.sin(index / 3 + offset)));

  return {
    date,
    clipRendered: wave(0, 4, 6),
    thumbnailGenerated: wave(1, 3, 4),
    seoGenerated: wave(2, 2, 3),
    audioTranscribed: wave(3, 3, 5),
    bestMomentsGenerated: wave(4, 2, 3),
  };
});

// Série fictícia de storage acumulado (em bytes), crescendo ao longo do ano.
const MOCK_STORAGE_SERIES = Array.from({ length: 365 }, (_, index) => ({
  date: format(subDays(new Date(), 364 - index), "yyyy-MM-dd"),
  storage: Math.round(
    (2 + index * 0.03 + Math.max(0, Math.sin(index / 9)) * 0.6) * 1024 ** 3,
  ),
}));

const GRANULARITY_DESCRIPTION: Record<UsageGranularity, string> = {
  daily: "Daily usage for the last 30 days.",
  weekly: "Weekly usage for the last 12 weeks.",
  monthly: "Monthly usage for the last 12 months.",
};

function getPeriodStart(granularity: UsageGranularity) {
  const today = startOfDay(new Date());
  if (granularity === "weekly") return subWeeks(today, 11);
  if (granularity === "monthly") return subMonths(today, 11);
  return subDays(today, 29);
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function OrgUsagePage() {
  const { slug } = Route.useParams();

  const [granularity, setGranularity] = useState<UsageGranularity>("daily");

  const period = useMemo(
    () => ({ from: getPeriodStart(granularity), to: new Date() }),
    [granularity],
  );

  const { data } = useQuery({
    queryKey: ["usage", slug, period.from, period.to],
    queryFn: () =>
      getUsageHttp({
        orgSlug: slug,
        startDate: period.from,
        endDate: period.to,
      }),
  });

  const usageSeries = aggregateUsageSeries(
    USE_MOCK_USAGE
      ? MOCK_USAGE_SERIES.filter((point) => new Date(point.date) >= period.from)
      : (data?.series ?? []),
    granularity,
  );

  const costs = data?.costs;
  const storage = data?.storage;
  const storageSeries = USE_MOCK_USAGE
    ? MOCK_STORAGE_SERIES.filter((point) => new Date(point.date) >= period.from)
    : (data?.storageSeries ?? []);
  const hasStorageData = data
    ? storageSeries.some((point) => point.storage > 0)
    : true;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usage</h1>
          <p className="text-sm text-muted-foreground">
            Track your spending and storage over time.
          </p>
        </div>
      </header>

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_26.625rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Costs */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md border">
                    <CircleDollarSign className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Costs
                  </span>
                </div>
                <Badge variant={(costs?.changePercentage ?? 0) > 0 ? "destructive" : "default"}>
                  {(costs?.changePercentage ?? 0) >= 0 ? (
                    <ArrowUpRight className="size-3 shrink-0" />
                  ) : (
                    <ArrowDownRight className="size-3 shrink-0" />
                  )}
                  {Math.abs(costs?.changePercentage ?? 0).toFixed(1)}% vs last month
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {currencyFormatter.format((costs?.currentCents ?? 0) / 100)}
              </p>
              <p className="text-xs text-muted-foreground">
                Last month:{" "}
                <span className="font-medium text-foreground">
                  {currencyFormatter.format((costs?.previousCents ?? 0) / 100)}
                </span>
              </p>
            </div>

            {/* Storage */}
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card dark:bg-zinc-900/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md border ">
                    <HardDrive className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Storage
                  </span>
                </div>
                <Badge>
                  {(storage?.changePercentage ?? 0) >= 0 ? (
                    <ArrowUpRight className="size-3 shrink-0" />
                  ) : (
                    <ArrowDownRight className="size-3 shrink-0" />
                  )}
                  {Math.abs(storage?.changePercentage ?? 0).toFixed(1)}% vs last month
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatBytes(storage?.currentBytes ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Last month:{" "}
                <span className="font-medium text-foreground">
                  {formatBytes(storage?.previousBytes ?? 0)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            <CostsChart
              title="Usage"
              description={GRANULARITY_DESCRIPTION[granularity]}
              granularity={granularity}
              action={
                <UsageGranularityToggle
                  value={granularity}
                  onValueChange={setGranularity}
                />
              }
              data={usageSeries}
            />
          </div>
        </div>

        <PaymentCardSection />
      </div>

      <Separator />

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,1fr)_26.625rem]">
        <div className="flex min-w-0 flex-col">
          {hasStorageData ? (
            <StorageChart
              title="Storage"
              description="Cumulative storage used for the selected period."
              data={storageSeries}
            />
          ) : (
            <StorageChartEmpty
              title="Storage"
              description="Cumulative storage used for the selected period."
            />
          )}
        </div>
        <BillingEmailForm />
      </div>

      <Separator />

      <InvoiceHistory />
    </div>
  );
}
