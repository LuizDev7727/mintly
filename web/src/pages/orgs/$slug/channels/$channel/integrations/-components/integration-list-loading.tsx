import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function IntegrationListLoading() {
  // number of available integrations to display
  const integrationsCount = 2;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: integrationsCount }).map(() => {
        return (
          <div className="h-full">
            <div className="flex h-full flex-col rounded-md border p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>

              <Separator className="my-4" />

              <div className="flex h-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
