import { PlusCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrganizationSchema,
  type CreateOrganizationFormType,
} from "@/schemas/organization/create-organization.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrganizationHttp } from "@/http/organization/create-organization.http";
import type { GetOrganizationsResponse } from "@/http/organization/get-organizations.http";
import { createSlug } from "@/utils/create-slug";
import { Spinner } from "./ui/spinner";

export function CreateOrganizationForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const slug = createSlug(watch("name"));

  const { mutateAsync: handleCreateOrganization } = useMutation({
    mutationFn: createOrganizationHttp,
    onSuccess: (data, variables) => {
      const { organizationId } = data;
      queryClient.setQueryData<GetOrganizationsResponse>(
        ["organizations"],
        (old) => {
          if (!old) return { organizations: [] };

          const newOrganizations = [
            ...old.organizations,
            {
              id: organizationId,
              name: variables.name,
              slug,
              membersCount: 1,
            },
          ];
          return { organizations: newOrganizations };
        },
      );
    },
  });

  async function onSubmit(formBody: CreateOrganizationFormType) {
    const { name } = formBody;
    await handleCreateOrganization({
      name,
      slug,
    });
  }

  console.log({ errors });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input placeholder="Acme" {...register("name")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input value={slug} disabled={true} />
        <p className="text-sm text-muted-foreground">
          The slug is automatically generated from the name.
        </p>
      </div>
      <Button className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : <PlusCircle />}
        Create Organization
      </Button>
    </form>
  );
}
