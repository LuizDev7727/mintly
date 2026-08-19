type AvailableEvent = {
  trigger: string
  description: string
}

type GetAvaiableEventsResponse = {
  triggers: AvailableEvent[]
}

export async function getAvaiableEvents(): Promise<GetAvaiableEventsResponse> {
  const triggers = [
    {
      trigger: "post.created",
      description: "Occurs whenever a post is created.",
    },
    {
      trigger: "post.failed",
      description: "Occurs whenever a post fails to publish.",
    },
    {
      trigger: "post.posted",
      description: "Occurs whenever a post is published.",
    },
    {
      trigger: "project.created",
      description: "Occurs whenever a project is created.",
    },
  ] as const

  return { triggers }
}
