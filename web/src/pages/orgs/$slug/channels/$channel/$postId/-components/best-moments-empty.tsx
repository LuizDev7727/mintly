import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Clapperboard } from "lucide-react";

/** Estado vazio da seção de melhores momentos, quando o post ainda não teve nenhum gerado. */
export function BestMomentsEmpty() {
  return (
    <Empty className="rounded-xl border p-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Clapperboard />
        </EmptyMedia>
        <EmptyTitle className="text-base">No best moments yet</EmptyTitle>
        <EmptyDescription>
          Generate the best moments of this video to get short clips ready to
          share.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
