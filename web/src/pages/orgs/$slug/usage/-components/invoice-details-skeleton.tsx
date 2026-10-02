import { Skeleton } from "@/components/ui/skeleton";

const sectionClassName = "rounded-xl border border-border/60 p-4";

/** Placeholder do conteúdo do sheet de detalhes enquanto o invoice carrega. */
export function InvoiceDetailsSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-label="Loading invoice details"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-12 rounded-4xl" />
          </div>
          <Skeleton className="h-3 w-56" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-9 w-32" />
      </div>

      <section className={`${sectionClassName} grid grid-cols-3 gap-5`}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </section>

      <section className={`${sectionClassName} space-y-4`}>
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </section>

      <section className={`${sectionClassName} space-y-4`}>
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          <div className="space-y-2">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionClassName} space-y-3`}>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
      </section>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    </div>
  );
}
