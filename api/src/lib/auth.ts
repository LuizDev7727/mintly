import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sessionsTable } from "@/infra/db/tables/sessions.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { verificationsTable } from "@/infra/db/tables/verifications.table.ts";
import { env } from "@/env.ts";
import { db } from "@/infra/db/client.ts";
import { tables } from "@/infra/db/tables/index.ts";
import { accountsTable } from "@/infra/db/tables/accounts.table.ts";
import { invitationsTable } from "@/infra/db/tables/invitations.table.ts";
import { membersTable } from "@/infra/db/tables/members.table.ts";
import { organizationsTable } from "@/infra/db/tables/organizations.table.ts";
import { testUtils } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.ALLOWED_ORIGIN],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: {
      ...tables,
      accounts: accountsTable,
      invitations: invitationsTable,
      members: membersTable,
      organizations: organizationsTable,
      sessions: sessionsTable,
      users: usersTable,
      verifications: verificationsTable,
    },
  }),
  advanced: {
    database: {
      generateId: false,
    },
    cookies: {
      state: {
        attributes: {
          sameSite: env.NODE_ENV === "production" ? "none" : "lax",
          secure: env.NODE_ENV === "production",
        },
      },
    },
  },
  plugins: [testUtils(), organization()],
});

const ctx = await auth.$context;
export const test = ctx.test;
