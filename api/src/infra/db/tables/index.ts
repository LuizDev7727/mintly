import { accountsTable } from "./accounts.table.ts";
import { activitiesTable } from "./activities.table.ts";
import { channelsTable, channelsRelations } from "./channels.table.ts";
import { foldersTable, foldersRelations } from "./folders.table.ts";
import { invitationsTable } from "./invitations.table.ts";
import { membersTable } from "./members.table.ts";
import { organizationsTable } from "./organizations.table.ts";
import { postsTable, postsRelations } from "./posts.table.ts";
import { sessionsTable } from "./sessions.table.ts";
import { usersTable } from "./users.table.ts";
import { verificationsTable } from "./verifications.table.ts";

export const tables = {
  accountsTable,
  channelsTable,
  channelsRelations,
  foldersTable,
  foldersRelations,
  invitationsTable,
  membersTable,
  organizationsTable,
  postsTable,
  postsRelations,
  sessionsTable,
  usersTable,
  verificationsTable,
  activitiesTable
};
