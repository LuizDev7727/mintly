import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { db } from "@/infra/db/client.ts"
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts"
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts"
import { postsTable } from "@/infra/db/tables/posts.table.ts"
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts"
import { uploadPostToYoutubeTask } from "@/infra/trigger/upload-post-to-youtube.task.ts"
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts"
import { tasks } from "@trigger.dev/sdk"
import { and, eq } from "drizzle-orm"

type SendBestMomentToSocialMedia = {
  channelId: string,
  bestMomentId: string,
  integrationId: string
  ownerId: string,
}

export async function sendBestMomentToSocialMedia(params: SendBestMomentToSocialMedia) {

  const { bestMomentId, integrationId, channelId, ownerId } = params

  const [bestMoment] = await
    db.select()
      .from(bestMomentsTable)
      .where(
        eq(bestMomentsTable.id, bestMomentId)
    )

  if(!bestMoment) {
    throw new ResourceNotFoundError("Best moment not found")
  }

  const [integration] = await
    db.select()
        .from(integrationsTable)
        .where(
          and(
            eq(integrationsTable.id, integrationId),
            eq(integrationsTable.channelId, channelId)
          )
        )

  if(!integration) {
    throw new ResourceNotFoundError("Integration not found")
  }

  const socialMediaSelected = integration.provider

  const [post] = await
    db.insert(postsTable)
      .values({
        channelId,
        description: "",
        title: bestMoment.title,
        duration: 0,
        mimeType: "video/mp4",
        ownerId,
        size: 0,
        thumbnailStorageKey: bestMoment.storageKey,
      })
      .returning({ id: postsTable.id })

  await db.insert(socialsToPostTable)
    .values({
      social: socialMediaSelected,
      socialName: integration.name,
      postId: post.id,
    })

  switch (socialMediaSelected) {
    case "YOUTUBE":
        const videoUrl = await generateSignedUrl({ key: bestMoment.storageKey })
        await tasks.trigger<typeof uploadPostToYoutubeTask>("upload-post-to-youtube", {
          videoUrl,
          title: bestMoment.title,
          description: "",
          tags: [],
          postId: post.id,
        });

        break;
      case "TIKTOK":

        break;
    }
}
