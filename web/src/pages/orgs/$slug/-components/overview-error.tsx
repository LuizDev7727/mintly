import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

export function OverviewError() {
  const { slug } = useParams({ from: "/orgs/$slug" });
  const queryClient = useQueryClient();

  function handleRetry() {
    queryClient.invalidateQueries({ queryKey: ["overview", slug] });
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-xl font-medium">Couldn't load the overview</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while loading your organization. Try again.
      </p>
      <Button variant="outline" onClick={handleRetry}>
        Try again
      </Button>
    </div>
  );
}
