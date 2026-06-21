import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarRangeIcon,
  CircleDollarSign,
  HardDrive,
} from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

function OrgUsagePage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  });

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
        <div className="*:not-first:mt-2">
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
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Costs */}
        <div className="flex flex-col gap-3 rounded-xl border border-border dark:bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-violet-500/10">
                <CircleDollarSign className="size-4 text-violet-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Costs
              </span>
            </div>
            <Badge variant={"destructive"}>
              <ArrowUpRight className="size-3 shrink-0" />
              15.4% vs last month
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">R$ 90,00</p>
          <p className="text-xs text-muted-foreground">
            Last month:{" "}
            <span className="font-medium text-foreground">R$ 78,00</span>
          </p>
        </div>

        {/* Storage */}
        <div className="flex flex-col gap-3 rounded-xl border border-border dark:bg-zinc-900/20 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-violet-500/10">
                <HardDrive className="size-4 text-violet-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Storage
              </span>
            </div>
            <Badge>
              <ArrowUpRight className="size-3 shrink-0" />
              3.2% vs last month
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">90 TB</p>
          <p className="text-xs text-muted-foreground">
            Last month:{" "}
            <span className="font-medium text-foreground">87.2 TB</span>
          </p>
        </div>
      </div>

      <Separator />
    </div>
  );
}
