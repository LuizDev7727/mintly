import { createFileRoute } from '@tanstack/react-router'
import { CreateChannelCard } from './-components/create-channel-card'
import { Suspense } from 'react'
import { ChannelsLoading } from './-components/channels-loading'
import { ChannelsList } from './-components/channels-list'

export const Route = createFileRoute('/orgs/$slug/channels/')({
  head: () => ({
    meta: [
      { title: "Channels | Mintly" },
      { name: "description", content: "Organization channels." },
    ],
  }),
  component: ChannelsPage,
})

function ChannelsPage() {

  return (
    <div>
      <h1 className='text-xl font-semibold'>Channels</h1>
      <p className='text-muted-foreground text-sm'>
        See all channels in your organization.
      </p>

      <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <CreateChannelCard />
        <Suspense fallback={<ChannelsLoading/>}>
          <ChannelsList />
        </Suspense>
      </div>
    </div>
  )
}
