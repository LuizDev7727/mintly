import { HardDrive } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type StorageChartEmptyProps = {
  title: string;
  description: string;
};

/** Estado vazio do gráfico de Storage, quando nada foi armazenado no período selecionado. */
export function StorageChartEmpty({
  title,
  description,
}: StorageChartEmptyProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-xl border border-border bg-card dark:bg-zinc-900/20 p-5">
      <div>
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Empty className="min-h-62.5 flex-1 rounded-xl border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HardDrive />
          </EmptyMedia>
          <EmptyTitle className="text-base">No storage used</EmptyTitle>
          <EmptyDescription>
            Files you upload will show up here once they count toward your
            storage in the selected period.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
