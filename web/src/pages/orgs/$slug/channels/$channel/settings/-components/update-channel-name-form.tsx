import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { updateChannelHttp } from "@/http/channel/update-channel.http";
import {
  updateChannelSchema,
  type UpdateChannelFormType,
} from "@/schemas/channel/update-channel.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useParams } from "@tanstack/react-router";
import type { GetChannelsResponse } from "@/http/channel/get-channels.http";
import { Save } from "lucide-react";

type UpdateChannelNameFormProps = {
  id: string;
  name: string;
};

export function UpdateChannelNameForm({
  id,
  name,
}: UpdateChannelNameFormProps) {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });
  const queryClient = useQueryClient();

  const channelQueryKey = ["channels", slug];

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
  } = useForm<UpdateChannelFormType>({
    resolver: zodResolver(updateChannelSchema),
    defaultValues: {
      name,
    },
  });

  const hasChannelNameChanged = dirtyFields.name !== undefined;

  const { mutateAsync } = useMutation({
    mutationFn: updateChannelHttp,
    onSuccess: (_, variables) => {
      const { id: updatedChannelId, name } = variables;
      queryClient.setQueryData<GetChannelsResponse>(channelQueryKey, (old) => {
        if (!old) {
          return old;
        }

        return {
          ...old,
          channels: old.channels.map((channel) =>
            channel.id === updatedChannelId ? { ...channel, name } : channel,
          ),
        };
      });

      toast("Channel updated successfully");
    },
  });

  async function handleUpdateChannel(formBody: UpdateChannelFormType) {
    await mutateAsync({
      id,
      name: formBody.name,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleUpdateChannel)}>
      <Card className="bg-transparent shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Channel Name</CardTitle>
          <CardDescription>
            This is your channel's visible name within{" "}
            <span className="font-semibold">{name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Input
            {...register("name")}
            placeholder="Channel name"
            className="max-w-sm"
          />
        </CardContent>
        <CardFooter className="justify-between border-t">
          <p className="text-sm text-muted-foreground">
            Maximum 32 characters.
          </p>
          <Button size="sm" disabled={!hasChannelNameChanged} type="submit">
            {isSubmitting ? <Spinner /> : null}
            {!isSubmitting && <Save className="size-4" />}
            Update Channel
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
