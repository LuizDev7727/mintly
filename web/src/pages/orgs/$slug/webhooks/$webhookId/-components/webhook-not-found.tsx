import { Button } from "@/components/ui/button"
import { Link, useParams } from "@tanstack/react-router"
import { ArrowLeft, WebhookOff } from "lucide-react"

export function WebhookNotFound() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  })

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-11 items-center justify-center rounded-full border bg-background">
        <WebhookOff className="size-4 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">Webhook not found</p>
        <p className="text-muted-foreground text-sm">
          It may have been deleted, or you don't have access to it.
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/orgs/$slug/webhooks" params={{ slug }}>
          <ArrowLeft className="size-4" />
          Back to webhooks
        </Link>
      </Button>
    </div>
  )
}
