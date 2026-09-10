import { useEffect, useState } from "react"
import { FileTextIcon, FolderIcon, LayoutGridIcon, SearchIcon } from "lucide-react"
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
import { getSearchResultsHttp } from "@/http/search/get-search-results.http"

const SEARCH_KEYBOARD_SHORTCUT = "k"
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_DELAY_MS = 300

type SearchResult = {
  id: string
  title: string
  channelId: string
}

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

  function handleSelectPost(post: SearchResult) {
    navigate({
      to: "/orgs/$slug/channels/$channel/$postId",
      params: { slug: orgSlug, channel: post.channelId, postId: post.id },
    })
    closeAndReset()
  }

  function handleSelectProject(project: SearchResult) {
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

  function handleSelectFolder(folder: SearchResult) {
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
      <div onClick={() => setOpen(true)} className="w-fit cursor-pointer">
        <SearchIcon className="size-4" />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput
          placeholder="Search posts, projects and folders."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!shouldSearch && (
            <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
          )}
          {shouldSearch && isLoading && (
            <CommandEmpty>Searching...</CommandEmpty>
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
                >
                  <FileTextIcon />
                  <span>{post.title}</span>
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
                >
                  <LayoutGridIcon />
                  <span>{project.title}</span>
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
