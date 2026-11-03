import type { ReactNode } from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import {
  CalendarClock,
  CalendarPlus,
  FileType,
  Folder,
  HardDrive,
  PanelRightClose,
  Share2,
  Timer,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dayjs } from "@/lib/dayjs"
import type { PostDetails } from "@/types/post"
import { formatBytes } from "@/utils/format-bytes"
import { formatDuration } from "@/utils/format-duration"
import { getInitials } from "@/utils/get-initials"
import { PostLogStep, type PostLogStepData } from "./post-log-step"

type PostLogsSheetPost = Pick<
  PostDetails,
  | "title"
  | "description"
  | "mimeType"
  | "size"
  | "duration"
  | "folder"
  | "socialsToPost"
  | "author"
  | "createdAt"
> & {
  scheduledTo: string | null
}

// TODO: remover — post fictício até o sheet receber o post de verdade (e a API
// devolver `scheduledTo` em `PostDetails`).
const MOCK_POST: PostLogsSheetPost = {
  title: "Product launch teaser.mp4",
  description:
    "Teaser de 30 segundos para o lançamento da nova coleção. Versão vertical para Reels, TikTok e Shorts.",
  mimeType: "video/mp4",
  size: 50_541_363,
  duration: 30,
  folder: { id: "mock-folder", title: "Campaigns / Launch" },
  socialsToPost: [
    { social: "INSTAGRAM", socialName: "Instagram" },
    { social: "TIKTOK", socialName: "TikTok" },
    { social: "YOUTUBE", socialName: "YouTube" },
  ],
  scheduledTo: "2026-11-04T18:00:00",
  author: { name: "Talan Korsgaard", avatarUrl: "https://github.com/LuizDev7727.png" },
  createdAt: "2026-10-28T10:35:00",
}

const SOCIAL_AVATARS = {
  INSTAGRAM: { label: "IG", className: "bg-purple-600 text-white" },
  TIKTOK: { label: "TK", className: "bg-black text-white" },
  YOUTUBE: { label: "YT", className: "bg-red-600 text-white" },
} as const

// TODO: remover — etapas fictícias até os logs virem dos eventos do post.
const MOCK_STEPS: PostLogStepData[] = [
  {
    id: "encode-video",
    title: "Encode video",
    description: "Convert MP4 to MP3",
    status: "DONE",
    startedAt: "10:45:02",
    duration: "12.4s",
    progress: {
      label: "Encoded",
      percentage: 100,
      current: "00:30",
      total: "00:30",
      speed: "2.4x speed",
      footer: "Done in 12.4s",
    },
    logs: [
      { at: "10:45:02", message: "Started convert-video-to-mp3" },
      { at: "10:45:04", message: "Downloaded 48.2 MB from storage" },
      { at: "10:45:13", message: "Encoded 00:30 of audio" },
      { at: "10:45:14", message: "Uploaded audio track" },
    ],
  },
  {
    id: "transcribe-audio",
    title: "Transcribe audio",
    description: "Speech to text",
    status: "DONE",
    startedAt: "10:45:15",
    duration: "38.1s",
    progress: null,
    logs: [
      { at: "10:45:15", message: "Started transcribe-audio" },
      { at: "10:45:52", message: "Transcribed 74 words" },
      { at: "10:45:53", message: "Saved the transcript" },
    ],
  },
  {
    id: "generate-metadata",
    title: "Generate metadata",
    description: "Title, description and tags",
    status: "RUNNING",
    startedAt: "10:45:54",
    duration: null,
    progress: {
      label: "Analyzing",
      percentage: 62,
      current: "00:19",
      total: "00:30",
      speed: "1.6x speed",
      footer: "About 7s left",
    },
    logs: [
      { at: "10:45:54", message: "Started seo-enrichment" },
      { at: "10:45:58", message: "Reading the transcript" },
    ],
  },
  {
    id: "publish",
    title: "Publish to socials",
    description: "Instagram, TikTok and YouTube",
    status: "PENDING",
    startedAt: null,
    duration: null,
    progress: null,
    logs: [],
  },
]

type PostLogsSheetProps = {
  post?: PostLogsSheetPost
  steps?: PostLogStepData[]
}

export function PostLogsSheet({
  post = MOCK_POST,
  steps = MOCK_STEPS,
}: PostLogsSheetProps) {
  const hasSocials = post.socialsToPost.length > 0
  const hasScheduledTo = post.scheduledTo !== null
  const hasDescription = post.description.trim().length > 0

  const properties: { icon: ReactNode; label: string; value: ReactNode }[] = [
    {
      icon: <FileType />,
      label: "Mime type",
      value: (
        <Badge
          variant="ghost"
          className="rounded-md bg-primary/15 text-lime-700 dark:text-primary"
        >
          {post.mimeType}
        </Badge>
      ),
    },
    {
      icon: <HardDrive />,
      label: "Size",
      value: formatBytes(post.size),
    },
    {
      icon: <Timer />,
      label: "Duration",
      value: formatDuration(post.duration),
    },
    {
      icon: <Folder />,
      label: "Folder",
      value: post.folder ? (
        <Badge variant="secondary" className="rounded-md">
          {post.folder.title}
        </Badge>
      ) : (
        <span className="text-muted-foreground">No folder</span>
      ),
    },
    {
      icon: <Share2 />,
      label: "Social posted",
      value: hasSocials ? (
        <div className="flex -space-x-1">
          {post.socialsToPost.map(({ social, socialName }) => (
            <Avatar
              key={social}
              size="sm"
              title={socialName}
              className="ring-2 ring-popover"
            >
              <AvatarFallback
                className={`text-[10px] font-medium ${SOCIAL_AVATARS[social].className}`}
              >
                {SOCIAL_AVATARS[social].label}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">Not posted yet</span>
      ),
    },
    {
      icon: <CalendarClock />,
      label: "Scheduled to",
      value: hasScheduledTo ? (
        <span>
          {dayjs(post.scheduledTo).format("LL")}{" "}
          <span className="text-muted-foreground">
            {dayjs(post.scheduledTo).format("LT")}
          </span>
        </span>
      ) : (
        <span className="text-muted-foreground">Not scheduled</span>
      ),
    },
    {
      icon: <User />,
      label: "Owner",
      value: (
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {post.author.avatarUrl && (
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            )}
            <AvatarFallback className="bg-primary text-[10px] font-medium text-primary-foreground">
              {getInitials(post.author.name)}
            </AvatarFallback>
          </Avatar>
          <span>{post.author.name}</span>
        </div>
      ),
    },
    {
      icon: <CalendarPlus />,
      label: "Created at",
      value: (
        <span>
          {dayjs(post.createdAt).format("LL")}{" "}
          <span className="text-muted-foreground">
            {dayjs(post.createdAt).format("LT")}
          </span>
        </span>
      ),
    },
  ]

  return (
    <SheetPrimitive.Root>
      <SheetPrimitive.Trigger>Logs Post</SheetPrimitive.Trigger>

      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />

        <SheetPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out sm:max-w-xl data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-right-10 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-right-10"
        >
          <div className="flex h-11 shrink-0 items-center border-b px-4">
            <SheetPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm">
                <PanelRightClose />
                <span className="sr-only">Close</span>
              </Button>
            </SheetPrimitive.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-6 p-8">
              <SheetPrimitive.Title className="text-2xl font-semibold tracking-tight text-foreground">
                {post.title}
              </SheetPrimitive.Title>

              <dl className="flex flex-col">
                {properties.map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                  >
                    <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                      {icon}
                      {label}
                    </dt>
                    <dd className="flex items-center">{value}</dd>
                  </div>
                ))}
              </dl>

              {hasDescription && (
                <section className="rounded-lg bg-muted/50 p-4">
                  <h3 className="text-xs font-medium text-foreground">
                    Description
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </section>
              )}
            </div>

            <Tabs defaultValue="logs" className="gap-0">
              <TabsList
                variant="line"
                className="relative h-auto w-full justify-start gap-0 px-8 pl-5 group-data-horizontal/tabs:h-auto before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border"
              >
                <TabsTrigger
                  value="logs"
                  className="h-auto flex-none rounded-none px-0 py-2.5 data-active:text-primary dark:data-active:text-primary group-data-horizontal/tabs:after:bottom-0 after:bg-primary"
                >
                  Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="p-8">
                <ol className="flex flex-col">
                  {steps.map((step) => (
                    <PostLogStep key={step.id} step={step} />
                  ))}
                </ol>
              </TabsContent>
            </Tabs>
          </div>

        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}
