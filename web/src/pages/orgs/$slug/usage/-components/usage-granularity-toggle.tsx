import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { UsageGranularity } from "./aggregate-usage-series";

type UsageGranularityToggleProps = {
  value: UsageGranularity;
  onValueChange: (value: UsageGranularity) => void;
};

const itemClassName =
  "text-muted-foreground data-[state=on]:text-foreground";

export function UsageGranularityToggle({
  value,
  onValueChange,
}: UsageGranularityToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      spacing={1}
      className="rounded-lg border border-border/60 p-0.5"
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue as UsageGranularity);
      }}
    >
      <ToggleGroupItem value="daily" size="sm" className={itemClassName}>
        Daily
      </ToggleGroupItem>
      <ToggleGroupItem value="weekly" size="sm" className={itemClassName}>
        Weekly
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" size="sm" className={itemClassName}>
        Monthly
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
