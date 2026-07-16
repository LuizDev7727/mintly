import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Film } from "lucide-react";

export function BestMomentsEmpty() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Film />
        </EmptyMedia>
        <EmptyTitle>No best moments yet</EmptyTitle>
        <EmptyDescription>
          This project is still being processed. Clips will show up here as
          soon as they're ready.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
