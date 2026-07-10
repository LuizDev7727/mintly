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
import type { GetActiveOrganizationResponse } from "@/http/organization/get-active-organization.http";
import { updateOrganizationHttp } from "@/http/organization/update-organization.http";
import {
  updateOrganizationSchema,
  type UpdateOrganizationFormType,
} from "@/schemas/organization/update-organization.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type UpdateOrganizationNameFormProps = {
  slug: string;
  name: string;
};

export function UpdateOrganizationNameForm({
  slug,
  name,
}: UpdateOrganizationNameFormProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
  } = useForm<UpdateOrganizationFormType>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      name,
    },
  });

  const hasNameChanged = dirtyFields.name !== undefined;

  const { mutateAsync } = useMutation({
    mutationFn: updateOrganizationHttp,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<GetActiveOrganizationResponse>(
        ["active-organization"],
        (old) => {
          if (!old) return old;

          return {
            organization: { ...old.organization, name: variables.name },
          };
        },
      );

      toast("Organization updated successfully");
    },
  });

  async function onSubmit(formBody: UpdateOrganizationFormType) {
    await mutateAsync({ slug, name: formBody.name });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="bg-transparent shadow-none">
        <CardHeader className="border-b">
          <CardTitle>Organization Name</CardTitle>
          <CardDescription>
            This is your organization's visible name within{" "}
            <span className="font-bold">{name}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Input
            {...register("name")}
            placeholder={name}
            className="max-w-sm"
          />
        </CardContent>
        <CardFooter className="border-t justify-between">
          <p className="text-sm text-muted-foreground">
            Maximum 32 characters.
          </p>
          <Button size="sm" type="submit" disabled={!hasNameChanged}>
            {isSubmitting ? <Spinner /> : "Save"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
