import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { createChannelHttp } from "@/http/channel/create-channel.http";
import type { GetOnboardingResponse } from "@/http/onboarding/get-onboarding.http";
import {
  createChannelSchema,
  type CreateChannelFormType,
} from "@/schemas/channel/create-channel.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

type CreateChannelStepFormProps = {
  orgSlug: string;
};

export function CreateChannelStepForm({ orgSlug }: CreateChannelStepFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateChannelFormType>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: { name: "", description: "" },
  });

  const { mutateAsync: handleCreateChannel, isPending } = useMutation({
    mutationFn: createChannelHttp,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["onboarding"] });

      const previous = queryClient.getQueryData<GetOnboardingResponse>([
        "onboarding",
      ]);

      if (previous) {
        queryClient.setQueryData<GetOnboardingResponse>(["onboarding"], {
          ...previous,
          step: previous.step + 1,
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["onboarding"], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  async function onSubmit({ name, description }: CreateChannelFormType) {
    await handleCreateChannel({ org: orgSlug, name, description });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="channel-name">Channel name</FieldLabel>
          <Input
            id="channel-name"
            placeholder="My channel"
            {...register("name")}
          />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor="channel-description">Description</FieldLabel>
          <Textarea
            id="channel-description"
            placeholder="What is this channel about?"
            {...register("description")}
          />
          {errors.description && (
            <FieldError>{errors.description.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Spinner />}
        Continue
      </Button>
    </form>
  );
}
