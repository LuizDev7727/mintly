import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, desc, eq, sql } from "drizzle-orm";

const RESULTS_PER_TYPE = 5;

type SearchResourcesParams = {
  organizationSlug: string;
  query: string;
};

type SearchResourcesResponse = {
  posts: {
    id: string;
    title: string;
    channelId: string;
    thumbnailUrl: string | null;
    description: string;
  }[];
  projects: {
    id: string;
    title: string;
    channelId: string;
    thumbnailUrl: string | null;
  }[];
  folders: { id: string; title: string; channelId: string }[];
};

export async function searchResources(
  params: SearchResourcesParams,
): Promise<SearchResourcesResponse> {
  const { organizationSlug, query } = params;

  const tsQuery = sql`websearch_to_tsquery('simple', ${query})`;

  const [postsQueryResult, projects, folders] = await Promise.all([
    db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        channelId: postsTable.channelId,
        thumbnailStorageKey: postsTable.thumbnailStorageKey,
        description: postsTable.description,
      })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${postsTable.searchVector} @@ ${tsQuery}`,
        ),
      )
      .orderBy(desc(sql`ts_rank(${postsTable.searchVector}, ${tsQuery})`))
      .limit(RESULTS_PER_TYPE),
    db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        channelId: projectsTable.channelId,
        thumbnailUrl: projectsTable.thumbnailUrl,
      })
      .from(projectsTable)
      .innerJoin(channelsTable, eq(projectsTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${projectsTable.searchVector} @@ ${tsQuery}`,
        ),
      )
      .orderBy(desc(sql`ts_rank(${projectsTable.searchVector}, ${tsQuery})`))
      .limit(RESULTS_PER_TYPE),
    db
      .select({
        id: foldersTable.id,
        title: foldersTable.title,
        channelId: foldersTable.channelId,
      })
      .from(foldersTable)
      .innerJoin(channelsTable, eq(foldersTable.channelId, channelsTable.id))
      .where(
        and(
          eq(channelsTable.organizationSlug, organizationSlug),
          sql`${foldersTable.searchVector} @@ ${tsQuery}`,
        ),
      )
      .orderBy(desc(sql`ts_rank(${foldersTable.searchVector}, ${tsQuery})`))
      .limit(RESULTS_PER_TYPE),
  ]);

  const posts = await Promise.all(
    postsQueryResult.map(async ({ thumbnailStorageKey, ...post }) => ({
      ...post,
      thumbnailUrl: thumbnailStorageKey
        ? await generateSignedUrl({ key: thumbnailStorageKey })
        : null,
    })),
  );

  return { posts, projects, folders };
}
