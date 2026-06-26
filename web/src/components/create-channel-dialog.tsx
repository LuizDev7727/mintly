import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateChannelForm } from "./create-channel-form";

export function CreateChannelDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-1">
          <Plus className="size-4" />
          Create new channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Channel</DialogTitle>
          <DialogDescription>
            Create a new channel in your organization.
          </DialogDescription>
        </DialogHeader>
        <CreateChannelForm />
      </DialogContent>
    </Dialog>
  );
}
