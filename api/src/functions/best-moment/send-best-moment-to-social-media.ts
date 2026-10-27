import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts"
import { UnsupportedProviderError } from "@/errors/unsupported-provider.error.ts"
import { db } from "@/infra/db/client.ts"
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts"
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts"
import { postsTable } from "@/infra/db/tables/posts.table.ts"
import { projectsTable } from "@/infra/db/tables/projects.table.ts"
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts"
import { publishBestMomentTask } from "@/infra/trigger/publish-best-moment.task.ts"
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

  // O clipe precisa ser de um projeto do canal da URL: só o id do clipe faria
  // o arquivo de outra organização ser publicado nas redes deste canal.
  const [bestMoment] = await
    db.select({
      title: bestMomentsTable.title,
      storageKey: bestMomentsTable.storageKey,
    })
      .from(bestMomentsTable)
      .innerJoin(projectsTable, eq(bestMomentsTable.projectId, projectsTable.id))
      .where(
        and(
          eq(bestMomentsTable.id, bestMomentId),
          eq(projectsTable.channelId, channelId),
        )
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

  // Só o YouTube tem publicação de melhor momento hoje. Recusar antes de criar
  // o post evita deixar um post que nunca vai ser publicado.
  if (socialMediaSelected !== "YOUTUBE") {
    throw new UnsupportedProviderError(
      `Publishing a best moment on ${socialMediaSelected} is not supported yet`,
    )
  }

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
      avatarUrl: integration.avatarUrl
    })

  const videoUrl = await generateSignedUrl({ key: bestMoment.storageKey })

  await tasks.trigger<typeof publishBestMomentTask>("publish-best-moment", {
    videoUrl,
    title: bestMoment.title,
    postId: post.id,
    integrationId: integration.id,
    channelId,
  })
}
