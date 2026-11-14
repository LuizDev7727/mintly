import { Dialog as SheetPrimitive } from "radix-ui"
import type { Post } from "@/types/post"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarPlus, FileType, Folder, HardDrive, Loader, Logs, PanelRightClose, Share2, Timer, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostLogStep } from "./post-log-step"
import { formatBytes } from "@/utils/format-bytes"
import { formatDuration } from "@/utils/format-duration"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/utils/get-initials"
import { dayjs } from "@/lib/dayjs"
import { PostEmptyLogsSheet } from "./post-empty-logs-sheet"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { getPostEventsHttp } from "@/http/events/get-post-events.http"
type PostLogStepStatus = "DONE" | "RUNNING" | "PENDING" | "ERROR"

type PostLogsSheetProps = Post & {
  id: string
  title: string
  description: string
  status: PostLogStepStatus
  startedAt: string | null
  duration: number | null
  scheduledTo: Date | null
}

function PostLogsLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-6 text-muted-foreground"
    >
      <Loader className="size-4 animate-spin text-primary" />
      <span className="animate-pulse text-sm">Getting events...</span>
    </div>
  )
}

export function PostLogsSheet(post: PostLogsSheetProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel"
  })

  const { data, isFetching } = useQuery({
    queryKey: ['post-logs', post.id],
    queryFn: async () => getPostEventsHttp({
      orgSlug: slug,
      channelId: channel,
      postId: post.id
    }),
    staleTime: 1000 * 60, // 60 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 20, // 20 seconds
    refetchIntervalInBackground: false
  })

  const postEvents = data?.postEvents ?? []
  const isEventsEmpty = postEvents.length === 0

  const hasSocials = post.socialsToPost.length > 0
  const isPostScheduled = post.scheduledTo !== null
  const hasDescription = post.description.trim().length > 0


  return (
    <SheetPrimitive.Root>
      <SheetPrimitive.Trigger asChild>
        <Button variant={'ghost'} className="w-full justify-start">
          <Logs className="size-4"/>
          Logs
        </Button>
      </SheetPrimitive.Trigger>

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
                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <FileType/>
                    Mime Type
                  </dt>
                  <dd className="flex items-center">{post.mimeType}</dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <HardDrive/>
                    Size
                  </dt>
                  <dd className="flex items-center">{formatBytes(post.size)}</dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <Timer/>
                    Duration
                  </dt>
                  <dd className="flex items-center">{formatDuration(post.duration ?? 0)}</dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <Folder/>
                    Folder
                  </dt>
                  <dd className="flex items-center">
                    <span className="text-muted-foreground">No folder</span>
                  </dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <Share2/>
                    Socials Posted
                  </dt>
                  <dd className="flex items-center">
                    {
                      hasSocials ? (
                        <div className="flex -space-x-1">
                          {post.socialsToPost.map(({ social, socialName }) => (
                            <Avatar
                              key={social}
                              size="sm"
                              title={socialName}
                              className="ring-2 ring-popover"
                            >
                              <AvatarFallback
                                className={`text-[10px] font-medium`}
                              >
                                {getInitials(socialName)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not posted yet</span>
                      )
                    }
                  </dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <Calendar/>
                    Scheduled To
                  </dt>
                  <dd className="flex items-center">
                    {
                      isPostScheduled ? (
                        <span>
                          {dayjs(post.scheduledTo).format("LL")}{" "}
                          <span className="text-muted-foreground">
                            {dayjs(post.scheduledTo).format("LT")}
                          </span>
                        </span>
                      ) :
                      (
                        <span className="text-muted-foreground">Not scheduled</span>
                      )
                    }
                  </dd>
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <User/>
                    Owner
                  </dt>
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
                </div>

                <div
                  className="grid grid-cols-[9rem_1fr] items-center gap-4 py-2.5"
                >
                  <dt className="flex items-center gap-2.5 text-muted-foreground [&_svg]:size-4">
                    <CalendarPlus/>
                    Created at
                  </dt>
                  <div className="flex items-center gap-2">
                    <span>
                      {dayjs(post.createdAt).format("LL")}{" "}
                      <span className="text-muted-foreground">
                        {dayjs(post.createdAt).format("LT")}
                      </span>
                    </span>
                  </div>
                </div>
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
                className="relative h-auto w-full justify-start gap-0 px-8 pb-0 group-data-horizontal/tabs:h-auto before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border"
              >
                <TabsTrigger
                  value="logs"
                  className="h-auto flex-none rounded-none px-0 py-2.5 data-active:text-primary dark:data-active:text-primary group-data-horizontal/tabs:after:bottom-0 after:bg-primary"
                >
                  Logs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="logs" className="p-8">

                {!isEventsEmpty && (
                  <ol className="flex flex-col">
                    {postEvents.map((step) => (
                      <PostLogStep key={step.id} step={step} />
                    ))}
                  </ol>
                )}

                {isFetching && <PostLogsLoading />}

                {!isFetching && isEventsEmpty && <PostEmptyLogsSheet />}
              </TabsContent>
            </Tabs>
          </div>

        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  )
}
