import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteChannelHttp } from "@/http/channel/delete-channel.http";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";

type ConfirmDeleteChannelDialogProps = {
  id: string;
  name: string;
};

export function ConfirmDeleteChannelDialog(
  params: ConfirmDeleteChannelDialogProps,
) {
  const { id, name } = params;
  const { slug } = useParams({ from: "/orgs/$slug" });
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: deleteChannelHttp,
    onSuccess: () => {
      toast("Channel deleted successfully");
      navigate({ to: "/orgs/$slug", params: { slug } });
    },
  });

  async function handleDeleteChannel() {
    await mutateAsync({ channelId: id });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash className="size-4" />
          Delete Channel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Channel</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{name}</span> ? This will
            permanently remove all projects, integrations, and data associated
            with it. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button
            onClick={handleDeleteChannel}
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <Trash className="size-4" />}
            Delete Channel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
