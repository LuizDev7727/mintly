import type { ReactNode } from "react"
import { Check, ChevronDown, CircleDashed, Loader, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"

export type PostLogStepStatus = "DONE" | "RUNNING" | "PENDING" | "ERROR"

export type PostLogStepData = {
  id: string
  title: string
  description: string
  status: PostLogStepStatus
  startedAt: string | null
  duration: string | null
  progress: {
    label: string
    percentage: number
    current: string
    total: string
    speed: string
    footer: string
  } | null
  logs: { at: string; message: string }[]
}

const STATUS_LABEL: Record<PostLogStepStatus, string> = {
  DONE: "Done",
  RUNNING: "Running",
  PENDING: "Pending",
  ERROR: "Failed",
}

const STATUS_ICON: Record<PostLogStepStatus, ReactNode> = {
  DONE: <Check className="size-4" />,
  RUNNING: <Loader className="size-4 animate-spin" />,
  PENDING: <CircleDashed className="size-4" />,
  ERROR: <X className="size-4" />,
}

type PostLogStepProps = {
  step: PostLogStepData
}

export function PostLogStep({ step }: PostLogStepProps) {
  const { title, description, status, startedAt, duration, progress, logs } = step

  const hasProgress = progress !== null
  const hasLogs = logs.length > 0

  return (
    <li
      data-slot="post-log-step"
      data-status={status}
      className="group/step flex gap-4 pb-6 last:pb-0"
    >
      <div className="flex flex-col items-center">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-border text-muted-foreground group-data-[status=DONE]/step:border-primary group-data-[status=DONE]/step:bg-primary group-data-[status=DONE]/step:text-primary-foreground group-data-[status=ERROR]/step:border-destructive group-data-[status=ERROR]/step:bg-destructive group-data-[status=ERROR]/step:text-white group-data-[status=RUNNING]/step:border-primary group-data-[status=RUNNING]/step:text-primary">
          {STATUS_ICON[status]}
        </span>
        <span
          aria-hidden="true"
          className="mt-1 w-px flex-1 bg-border group-data-[status=DONE]/step:bg-primary/50 group-last/step:hidden"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {startedAt && (
              <p className="text-xs text-muted-foreground">
                Started at {startedAt}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {duration && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {duration}
              </span>
            )}
            <Badge
              variant="secondary"
              className="rounded-md group-data-[status=DONE]/step:bg-primary/15 group-data-[status=DONE]/step:text-lime-700 dark:group-data-[status=DONE]/step:text-primary group-data-[status=ERROR]/step:bg-destructive/10 group-data-[status=ERROR]/step:text-destructive group-data-[status=RUNNING]/step:bg-amber-500/10 group-data-[status=RUNNING]/step:text-amber-500"
            >
              {STATUS_LABEL[status]}
            </Badge>
          </div>
        </div>

        {hasProgress && (
          <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between text-sm">
              <span>
                {progress.label}{" "}
                <strong className="font-semibold">{progress.percentage}%</strong>
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {progress.current} / {progress.total}
              </span>
            </div>

            <Progress value={progress.percentage} />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress.speed}</span>
              <span>{progress.footer}</span>
            </div>
          </div>
        )}

        {hasLogs && (
          <Collapsible>
            <CollapsibleTrigger className="group/logs flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
              <ChevronDown className="size-3.5 transition-transform group-data-[state=open]/logs:rotate-180" />
              <span className="group-data-[state=open]/logs:hidden">
                Show logs ({logs.length})
              </span>
              <span className="hidden group-data-[state=open]/logs:inline">
                Hide logs ({logs.length})
              </span>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <ul className="mt-2 space-y-1 rounded-lg bg-muted/30 p-3 font-mono text-xs">
                {logs.map(({ at, message }) => (
                  <li key={`${at}-${message}`} className="flex gap-3">
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {at}
                    </span>
                    <span className="min-w-0 break-words">{message}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </li>
  )
}
