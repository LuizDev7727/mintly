import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateWebhookForm } from "./create-webhook-form"

export function CreateWebhookDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          Add Endpoint
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Webhook Endpoint</DialogTitle>
          <DialogDescription>
            Mintly will send a POST request to this URL whenever one of the
            selected events happens.
          </DialogDescription>
        </DialogHeader>

        <CreateWebhookForm />
      </DialogContent>
    </Dialog>
  )
}
