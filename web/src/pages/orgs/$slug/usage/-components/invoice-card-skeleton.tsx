import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder com o mesmo formato do InvoiceCard, exibido enquanto a lista carrega. */
export function InvoiceCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-linear-to-br from-foreground/4 to-transparent p-4 dark:bg-zinc-900/20">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-14 rounded-md" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-6 rounded-md" />
      </div>
    </div>
  );
}
