import { createFileRoute } from '@tanstack/react-router'
import { CreateProjectForm } from './-components/create-project-form'

export const Route = createFileRoute(
  '/orgs/$slug/channels/$channel/projects/create-project/',
)({
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Create a new project by uploading videos to generate best moments',
      },
      { title: 'Create Project | Mintly' },
    ],
  }),
  component: CreateProjectPage,
})

function CreateProjectPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create Project</h1>
        <p className="text-sm text-muted-foreground">
          Upload one or more videos to generate best moments for your channel
        </p>
      </div>
      <CreateProjectForm/>
    </div>
  )
}
