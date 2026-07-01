import {
  createChannelSchema,
  type CreateChannelFormType,
} from "@/schemas/channel/create-channel.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { createChannelHttp } from "@/http/channel/create-channel.http";
import type { GetChannelsResponse } from "@/http/channel/get-channels.http";
import type { Channel } from "@/types/channel";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createSlug } from "@/utils/create-slug";

export function CreateChannelForm() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateChannelFormType>({
    resolver: zodResolver(createChannelSchema),
  });

  const { mutateAsync: createChannel } = useMutation({
    mutationFn: createChannelHttp,
    onSuccess: ({ channelId }, { name }) => {
      const newChannel: Channel = {
        id: channelId,
        name,
        slug: createSlug(name),
        avatar: null,
        postsCount: 0,
        integrationsCount: 0,
        postsSize: [],
        totalPostsSize: 0,
      };

      queryClient.setQueryData<GetChannelsResponse>(
        ["channels", slug],
        (old) => {
          if (!old) return undefined;
          return { ...old, channels: [newChannel, ...old.channels] };
        },
      );

      toast("Channel created successfully!");
    },
  });

  async function handleCreateChannel(formBody: CreateChannelFormType) {
    await createChannel({
      org: slug,
      name: formBody.name,
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(handleCreateChannel)}>
      <Label>Name</Label>
      <Input {...register("name")} placeholder="Amazon" />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="animate-spin size-4" />
        ) : (
          <Plus className="size-4" />
        )}
        Create Channel
      </Button>
    </form>
  );
}
