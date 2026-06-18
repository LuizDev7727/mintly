import { CreateChannelDialog } from "@/components/create-channel-dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Cloud } from "lucide-react";

export function ChannelsListEmpty() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Cloud />
        </EmptyMedia>
        <EmptyTitle>Channels Empty</EmptyTitle>
        <EmptyDescription>
          No channels found. Create a channel to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateChannelDialog />
      </EmptyContent>
    </Empty>
  );
}
