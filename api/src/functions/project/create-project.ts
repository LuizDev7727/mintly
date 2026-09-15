import { db } from "@/infra/db/client.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { createProjectTask } from "@/infra/trigger/create-project.task.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { tasks } from "@trigger.dev/sdk";

type CreateProjectParams = {
  channelId: string;
  ownerId: string;
  files: {
    name: string;
    key: string;
  }[];
};

export async function createProject(params: CreateProjectParams) {
  const { channelId, ownerId, files } = params;

  for (const file of files) {
    await checkFileExists({ key: file.key });

    const [{ projectId }] = await db
      .insert(projectsTable)
      .values({
        title: file.name,
        channelId,
        ownerId,
      })
      .returning({ projectId: projectsTable.id });

    const videoUrl = await generateSignedUrl({ key: file.key });

    await tasks.trigger<typeof createProjectTask>("create-project", {
      videoUrl,
      projectId,
    });
  }
}
