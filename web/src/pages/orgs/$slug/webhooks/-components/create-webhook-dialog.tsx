import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const WEBHOOK_EVENTS = [
  { id: "post.published", label: "Post published" },
  { id: "post.failed", label: "Post failed" },
  { id: "project.completed", label: "Project completed" },
  { id: "project.failed", label: "Project failed" },
  { id: "channel.connected", label: "Channel connected" },
  { id: "channel.disconnected", label: "Channel disconnected" },
] as const

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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://example.com/webhooks/mintly"
            />
          </div>

          <div className="space-y-2">
            <Label>Events to send</Label>
            <div className="grid grid-cols-2 gap-2.5 rounded-md border p-3">
              {WEBHOOK_EVENTS.map((event) => (
                <Label
                  key={event.id}
                  htmlFor={event.id}
                  className="font-normal"
                >
                  <Checkbox id={event.id} />
                  {event.label}
                </Label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button>
            <PlusIcon className="size-4" />
            Add Endpoint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
