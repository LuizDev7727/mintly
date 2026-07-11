import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { ActivitiesList } from './-components/activities-list'
import { ActivitiesListLoading } from './-components/activities-list-loading'

export const Route = createFileRoute('/orgs/$slug/activities/')({
  head: () => ({
    meta: [
      { title: "Activities | Mintly" },
      { name: "description", content: "Organization activities." },
    ],
  }),
  component: ActivitiesPage,
})

function ActivitiesPage() {
  return (
    <div className='space-y-4 h-full'>
      <header>
        <h1 className='text-xl font-semibold'>Activities</h1>
        <p className='text-sm text-muted-foreground'>
          See all activities for this organization.
        </p>
      </header>
      <Suspense fallback={<ActivitiesListLoading />}>
        <ActivitiesList />
      </Suspense>
    </div>
  )
}
