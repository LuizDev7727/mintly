import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDeleteChannelDialog } from "./confirm-delete-channel-dialog";

type DeleteChannelProps = {
  id: string;
  name: string;
};

export function DeleteChannel(params: DeleteChannelProps) {
  const { id, name } = params;
  return (
    <Card className="bg-transparent shadow-none">
      <CardHeader className="border-b">
        <CardTitle>Delete Channel</CardTitle>
        <CardDescription>
          This will permanently delete your channel. This action is
          irreversible, so proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <p className="text-sm text-destructive">
          This action cannot be undone!
        </p>
        <ConfirmDeleteChannelDialog id={id} name={name} />
      </CardFooter>
    </Card>
  );
}
