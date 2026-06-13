import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsListLoading() {
  return (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="w-90 rounded-sm border" key={i}>
          <header className="p-4 flex items-center gap-x-2">
            <Skeleton className="size-10 rounded-sm shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
          </header>
          <Separator />
          <main className="p-4">
            <Skeleton className="h-3 w-full" />
          </main>
          <Separator />
          <footer className="p-4 flex items-center gap-x-2">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <Skeleton className="h-3 w-24" />
          </footer>
        </div>
      ))}
    </div>
  );
}
