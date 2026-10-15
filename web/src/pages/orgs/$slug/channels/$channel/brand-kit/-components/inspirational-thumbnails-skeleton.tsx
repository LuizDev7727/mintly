import { Skeleton } from "@/components/ui/skeleton";

export function InspirationalThumbnailsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
        <Skeleton key={index} className="aspect-video rounded-lg" />
      ))}
    </div>
  );
}
