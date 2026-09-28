import { useEffect, useState } from "react"
import { FolderIcon, ImageIcon, SearchIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  getSearchResultsHttp,
  type FolderSearchResult,
  type PostSearchResult,
  type ProjectSearchResult,
} from "@/http/search/get-search-results.http"

const SEARCH_KEYBOARD_SHORTCUT = "k"
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_DELAY_MS = 300

const isMac =
  typeof navigator !== "undefined" && /Mac/.test(navigator.platform)

/** Global search for posts, projects and folders, opened via the sidebar or Cmd/Ctrl+K. */
export function Search() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  const { slug: orgSlug } = useParams({ from: "/orgs/$slug" })
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SEARCH_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_DELAY_MS)

    return () => clearTimeout(timeoutId)
  }, [query])

  const shouldSearch = debouncedQuery.trim().length >= MIN_QUERY_LENGTH

  const { data, isLoading } = useQuery({
    queryKey: ["search", orgSlug, debouncedQuery],
    queryFn: async () => getSearchResultsHttp({
      orgSlug,
      query: debouncedQuery
    }),
    enabled: shouldSearch,
  })

  function closeAndReset() {
    setOpen(false)
    setQuery("")
    setDebouncedQuery("")
  }

  function handleSelectPost(post: PostSearchResult) {
    navigate({
      to: "/orgs/$slug/channels/$channel/$postId",
      params: { slug: orgSlug, channel: post.channelId, postId: post.id },
    })
    closeAndReset()
  }

  function handleSelectProject(project: ProjectSearchResult) {
    navigate({
      to: "/orgs/$slug/channels/$channel/projects/$projectId",
      params: {
        slug: orgSlug,
        channel: project.channelId,
        projectId: project.id,
      },
    })
    closeAndReset()
  }

  function handleSelectFolder(folder: FolderSearchResult) {
    navigate({
      to: "/orgs/$slug/channels/$channel",
      params: { slug: orgSlug, channel: folder.channelId },
      search: { folder_id: folder.id, folder_name: folder.title },
    })
    closeAndReset()
  }

  const hasResults =
    !!data &&
    (data.posts.length > 0 ||
      data.projects.length > 0 ||
      data.folders.length > 0)

  return (
    <div className="flex flex-col gap-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => setOpen(true)}
            tooltip="Search"
            className="cursor-pointer justify-between"
          >
            <div className="flex items-center gap-2">
              <SearchIcon />
              <span>Search</span>
            </div>
            <Kbd className="group-data-[collapsible=icon]:hidden">
              {isMac ? "⌘K" : "Ctrl+K"}
            </Kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search posts, projects and folders."
          value={query}
          onValueChange={setQuery}
          loading={shouldSearch && isLoading}
        />
        <CommandList>
          {!shouldSearch && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}
          {shouldSearch && isLoading && (
            <CommandEmpty className="animate-pulse">Searching...</CommandEmpty>
          )}
          {shouldSearch && !isLoading && !hasResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {data && data.posts.length > 0 && (
            <CommandGroup heading="Posts">
              {data.posts.map((post) => (
                <CommandItem
                  key={post.id}
                  value={`post-${post.id}`}
                  onSelect={() => handleSelectPost(post)}
                  className="items-start"
                >
                  <div className="aspect-video h-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {post.thumbnailUrl ? (
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{post.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {post.description || "No description"}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {data && data.projects.length > 0 && (
            <CommandGroup heading="Projects">
              {data.projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={`project-${project.id}`}
                  onSelect={() => handleSelectProject(project)}
                  className="items-start"
                >
                  <div className="aspect-video h-9 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate">{project.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      No description
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {data && data.folders.length > 0 && (
            <CommandGroup heading="Folders">
              {data.folders.map((folder) => (
                <CommandItem
                  key={folder.id}
                  value={`folder-${folder.id}`}
                  onSelect={() => handleSelectFolder(folder)}
                >
                  <FolderIcon />
                  <span>{folder.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
