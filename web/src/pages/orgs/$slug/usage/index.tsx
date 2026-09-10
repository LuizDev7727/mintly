import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRangeIcon,
  CircleDollarSign,
  HardDrive,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { format, subMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StorageChart } from "./-components/storage-chart";
import { CostsChart } from "./-components/costs-chart";
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

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function OrgUsagePage() {
  const { slug } = Route.useParams();

  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });

  const { data } = useQuery({
    queryKey: ["usage", slug, date?.from, date?.to],
    queryFn: () =>
      getUsageHttp({
        orgSlug: slug,
        startDate: date!.from!,
        endDate: date!.to!,
      }),
    enabled: Boolean(date?.from && date?.to),
  });

  const costs = data?.costs;
  const storage = data?.storage;

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Costs */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
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
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
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

      <Separator />

      <div className="flex items-center justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <CalendarRangeIcon className="size-4" />
              <span date-has-date={date?.from} className="truncate">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} –{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  "Pick a date range"
                )}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-2">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Usage</h2>
          <p className="text-sm text-muted-foreground">
            Daily usage for the selected period.
          </p>
        </div>
        <CostsChart data={data?.series ?? []} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Storage</h2>
          <p className="text-sm text-muted-foreground">
            Cumulative storage used for the selected period.
          </p>
        </div>
        <StorageChart data={data?.storageSeries ?? []} />
      </div>
    </div>
  );
}
