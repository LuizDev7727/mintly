import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { channelsTable } from "./tables/channels.table.ts";
import { foldersTable } from "./tables/folders.table.ts";
import { postsTable } from "./tables/posts.table.ts";
import { projectsTable } from "./tables/projects.table.ts";
import { usersTable } from "./tables/users.table.ts";

// Dataset for the load test. It runs AFTER `db:seed` (which creates the user,
// organization and channel) and fills that channel with enough rows for the list,
// filter and search routes to do real work.
//
// Everything here is in a final status (SUCCESS / PUBLISHED) and has no
// thumbnail, on purpose: the list routes only call Trigger.dev (realtime token)
// for in-progress rows and R2 (signed URL) for rows with a thumbnail, and the
// load test must exercise the database only.
const E2E_USER_EMAIL = "testuser@gmail.com";
const E2E_CHANNEL_ID = "019f1b80-42cf-79bb-b828-1cff43be9900";

const PROJECTS_COUNT = Number(process.env.PERF_PROJECTS ?? 1_000);
const POSTS_COUNT = Number(process.env.PERF_POSTS ?? 3_000);
const ROOT_FOLDERS_COUNT = 40;
const CHILD_FOLDERS_PER_ROOT = 4;
const BATCH_SIZE = 500;

async function insertInBatches<T>(
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insert(rows.slice(i, i + BATCH_SIZE));
  }
}

async function seedPerf() {
  // Fixed seed: every run produces the same dataset, so two runs are comparable.
  faker.seed(20260101);

  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, E2E_USER_EMAIL));

  const [channel] = await db
    .select({ id: channelsTable.id })
    .from(channelsTable)
    .where(eq(channelsTable.id, E2E_CHANNEL_ID));

  if (!user || !channel) {
    throw new Error("Run `pnpm db:seed` first: the e2e user/channel do not exist.");
  }

  console.log("Seeding perf folders");
  const rootFolders = await db
    .insert(foldersTable)
    .values(
      Array.from({ length: ROOT_FOLDERS_COUNT }, () => ({
        title: faker.lorem.words({ min: 1, max: 3 }),
        channelId: channel.id,
      })),
    )
    .returning({ id: foldersTable.id });

  const childFolders = await db
    .insert(foldersTable)
    .values(
      rootFolders.flatMap((root) =>
        Array.from({ length: CHILD_FOLDERS_PER_ROOT }, () => ({
          title: faker.lorem.words({ min: 1, max: 3 }),
          channelId: channel.id,
          parentId: root.id,
        })),
      ),
    )
    .returning({ id: foldersTable.id });

  const folderIds = [...rootFolders, ...childFolders].map((folder) => folder.id);

  console.log(`Seeding ${PROJECTS_COUNT} perf projects`);
  await insertInBatches(
    Array.from({ length: PROJECTS_COUNT }, () => ({
      title: faker.lorem.words({ min: 3, max: 8 }),
      status: "SUCCESS" as const,
      // Listed projects always have a run id in production (set by the Trigger.dev task).
      runId: `run_${faker.string.alphanumeric(20)}`,
      channelId: channel.id,
      ownerId: user.id,
    })),
    (batch) => db.insert(projectsTable).values(batch),
  );

  console.log(`Seeding ${POSTS_COUNT} perf posts`);
  await insertInBatches(
    Array.from({ length: POSTS_COUNT }, () => ({
      title: faker.lorem.words({ min: 3, max: 8 }),
      description: faker.lorem.sentences({ min: 1, max: 3 }),
      mimeType: "video/mp4",
      size: faker.number.int({ min: 1_000_000, max: 500_000_000 }),
      duration: faker.number.int({ min: 10, max: 3_600 }),
      status: "PUBLISHED" as const,
      runId: `run_${faker.string.alphanumeric(20)}`,
      channelId: channel.id,
      ownerId: user.id,
      // Roughly one post in three lives in a folder; the rest are at the root.
      folderId: faker.helpers.maybe(() => faker.helpers.arrayElement(folderIds), {
        probability: 0.33,
      }),
    })),
    (batch) => db.insert(postsTable).values(batch),
  );
}

seedPerf()
  .then(() => {
    console.log("Perf database seeded!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
