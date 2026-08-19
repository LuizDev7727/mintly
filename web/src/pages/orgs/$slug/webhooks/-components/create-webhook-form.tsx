import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogFooter } from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createWebhookSchema,
  type CreateWebhookFormType,
} from "@/schemas/webhook/create-webhook.schema"
import { getAvailableEventsHttp } from "@/http/webhook/get-available-events.http"
import { createWebhookHttp } from "@/http/webhook/create-webhook.http"
import type {
  GetWebhooksOverviewResponse,
  WebhookSummary,
} from "@/http/webhook/get-webhooks-overview.http"

export function CreateWebhookForm() {
  const { slug } = useParams({ from: "/orgs/$slug" })
  const queryClient = useQueryClient()

  const { data: availableEvents, isPending: isLoadingEvents } = useQuery({
    queryKey: ["webhook-available-events"],
    queryFn: getAvailableEventsHttp,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateWebhookFormType>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      url: "",
      triggers: [],
    },
  })

  const selectedTriggers = watch("triggers")

  function toggleTrigger(trigger: string, checked: boolean) {
    if (checked) {
      setValue(
        "triggers",
        [
          ...selectedTriggers,
          { trigger: trigger as CreateWebhookFormType["triggers"][number]["trigger"] },
        ],
        { shouldValidate: true },
      )
      return
    }

    setValue(
      "triggers",
      selectedTriggers.filter((item) => item.trigger !== trigger),
      { shouldValidate: true },
    )
  }

  const { mutateAsync: createWebhook } = useMutation({
    mutationFn: createWebhookHttp,
    onSuccess: (data, variables) => {
      queryClient.setQueryData<GetWebhooksOverviewResponse>(
        ["webhooks-overview", slug],
        (old) => {
          if (!old) return old

          const newWebhook: WebhookSummary = {
            id: data.id,
            url: variables.url,
            triggers: variables.triggers,
            signingSecret: data.signingKey,
            createdAt: new Date().toISOString(),
            lastLog: null,
          }

          return {
            ...old,
            webhooks: [newWebhook, ...old.webhooks],
          }
        },
      )

      toast("Webhook endpoint created successfully!")
    },
  })

  async function handleCreateWebhook(formBody: CreateWebhookFormType) {
    const { url, triggers } = formBody

    await createWebhook({
      orgSlug: slug,
      url,
      triggers: triggers.map((item) => item.trigger),
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleCreateWebhook)}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="webhook-url">Endpoint URL</Label>
        <Input
          id="webhook-url"
          placeholder="https://example.com/webhooks/mintly"
          {...register("url")}
        />
        {errors.url && <FieldError>{errors.url.message}</FieldError>}
      </div>

      <div className="space-y-2">
        <Label>Events to send</Label>

        {isLoadingEvents ? (
          <div className="grid grid-cols-2 gap-2.5 rounded-md border p-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 rounded-md border p-3">
            {availableEvents?.triggers.map((event) => (
              <Label
                key={event.trigger}
                htmlFor={event.trigger}
                className="font-normal"
                title={event.description}
              >
                <Checkbox
                  id={event.trigger}
                  checked={selectedTriggers.some(
                    (item) => item.trigger === event.trigger,
                  )}
                  onCheckedChange={(checked) =>
                    toggleTrigger(event.trigger, checked === true)
                  }
                />
                {event.trigger}
              </Label>
            ))}
          </div>
        )}

        {errors.triggers && (
          <FieldError>{errors.triggers.message}</FieldError>
        )}
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={isSubmitting}>
          <PlusIcon className="size-4" />
          Add Endpoint
        </Button>
      </DialogFooter>
    </form>
  )
}
