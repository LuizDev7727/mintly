import {
  AudioLines,
  CircleX,
  FileX,
  Image as ImageIcon,
  ImageOff,
  MicOff,
  Send,
  Tags,
  Video,
  VideoOff,
} from "lucide-react"

import type { PostEventStatus } from "@/http/events/get-post-events.http"
import { dayjs } from "@/lib/dayjs"

export type PostLogStepData = {
  id: string
  status: PostEventStatus
  createdAt: string
}

type PostLogStepProps = {
  step: PostLogStepData
}

export function PostLogStep({ step }: PostLogStepProps) {
  const { id, status, createdAt } = step

  const hasFailed = status.endsWith("_FAILED")

  return (
    <li
      data-slot="post-log-step"
      data-status={status}
      data-outcome={hasFailed ? "failed" : "success"}
      className="group/step flex gap-4"
    >
      <div className="flex flex-col items-center">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground group-data-[outcome=failed]/step:border-destructive group-data-[outcome=failed]/step:bg-destructive group-data-[outcome=failed]/step:text-white">
          {status === "ENCODED_VIDEO" && <Video className="size-4" />}
          {status === "ENCODED_VIDEO_FAILED" && <VideoOff className="size-4" />}
          {status === "TRANSCRIBED_AUDIO" && <AudioLines className="size-4" />}
          {status === "TRANSCRIBED_AUDIO_FAILED" && <MicOff className="size-4" />}
          {status === "GENERATED_METADATA" && <Tags className="size-4" />}
          {status === "GENERATED_METADATA_FAILED" && <FileX className="size-4" />}
          {status === "GENERATED_THUMBNAIL" && <ImageIcon className="size-4" />}
          {status === "GENERATED_THUMBNAIL_FAILED" && <ImageOff className="size-4" />}
          {status === "PUBLISHED" && <Send className="size-4" />}
          {status === "PUBLISHED_FAILED" && <CircleX className="size-4" />}
        </span>
        <span
          aria-hidden="true"
          className="w-px flex-1 bg-primary/50 group-data-[outcome=failed]/step:bg-destructive/50 group-last/step:hidden"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-3 pb-6 group-last/step:pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-medium text-foreground">
              {status === "ENCODED_VIDEO" && "Video encoded"}
              {status === "ENCODED_VIDEO_FAILED" && "Video encoding failed"}
              {status === "TRANSCRIBED_AUDIO" && "Audio transcribed"}
              {status === "TRANSCRIBED_AUDIO_FAILED" && "Audio transcription failed"}
              {status === "GENERATED_METADATA" && "Metadata generated"}
              {status === "GENERATED_METADATA_FAILED" && "Metadata generation failed"}
              {status === "GENERATED_THUMBNAIL" && "Thumbnail generated"}
              {status === "GENERATED_THUMBNAIL_FAILED" && "Thumbnail generation failed"}
              {status === "PUBLISHED" && "Published to socials"}
              {status === "PUBLISHED_FAILED" && "Publishing to socials failed"}
            </h4>
            <p className="text-sm text-muted-foreground">{id}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className="text-xs text-muted-foreground"
            >
              <time dateTime={dayjs(createdAt).toISOString()}>
                {dayjs(createdAt).format("ll · LT")}
              </time>
            </span>
          </div>
        </div>
      </div>
    </li>
  )
}
