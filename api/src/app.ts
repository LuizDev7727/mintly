import "./infra/http/instrumentation.ts";

import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";

import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { env } from "./env.ts";
import { errorHandler } from "./infra/http/routes/error-handler.ts";
import { getHealthRoute } from "./infra/http/routes/health/get-health.route.ts";
import { authRoute } from "./infra/http/routes/auth/auth.route.ts";
import { getChannelsRoute } from "./infra/http/routes/channel/get-channels.route.ts";
import { getChannelRoute } from "./infra/http/routes/channel/get-channel.route.ts";
import { createChannelRoute } from "./infra/http/routes/channel/create-channel.route.ts";
import { updateChannelRoute } from "./infra/http/routes/channel/update-channel.route.ts";
import { deleteChannelRoute } from "./infra/http/routes/channel/delete-channel.route.ts";
import { createFolderRoute } from "./infra/http/routes/folder/create-folder.route.ts";
import { deleteFolderRoute } from "./infra/http/routes/folder/delete-folder.route.ts";
import { getFoldersRoute } from "./infra/http/routes/folder/get-folders.route.ts";
import { updateFolderRoute } from "./infra/http/routes/folder/update-folder.route.ts";
import { getOrganizationMetricsRoute } from "./infra/http/routes/organization/get-metrics.route.ts";
import { getPostsRoute } from "./infra/http/routes/post/get-posts.route.ts";
import { getIntegrationsRoute } from "./infra/http/routes/integration/get-integrations.route.ts";
import { getOrganizationsRoute } from "./infra/http/routes/organization/get-organizations.route.ts";
import { getActiveOrganizationRoute } from "./infra/http/routes/organization/get-active-organization.route.ts";
import { setActiveOrganizationRoute } from "./infra/http/routes/organization/set-active-organization.route.ts";
import { createOrganizationRoute } from "./infra/http/routes/organization/create-organization.route.ts";
import { getMembersRoute } from "./infra/http/routes/organization/get-members.route.ts";
import { createInviteMemberRoute } from "./infra/http/routes/organization/create-invite-member.route.ts";
import { getPendingInvitesRoute } from "./infra/http/routes/invitation/get-pending-invites.route.ts";
import { acceptInviteRoute } from "./infra/http/routes/invitation/accept-invite.route.ts";
import { declineInviteRoute } from "./infra/http/routes/invitation/decline-invite.route.ts";
import { revokeInviteRoute } from "./infra/http/routes/organization/revoke-invite.route.ts";
import { updateOrganizationRoute } from "./infra/http/routes/organization/update-organization.route.ts";
import { requestYoutubeIntegrationUrlRoute } from "./infra/http/routes/integration/request-youtube-integration-url.route.ts";
import { youtubeCallbackRoute } from "./infra/http/routes/integration/youtube-callback.route.ts";
import { deleteIntegrationRoute } from "./infra/http/routes/integration/delete-integration.route.ts";

export const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(errorHandler);

if (env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Mintly API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: "/api/docs",
  });
}

server.register(fastifyCookie);

server.register(fastifyCors, {
  origin: env.ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
});

server.register(getHealthRoute);
server.register(authRoute);
server.register(getChannelsRoute);
server.register(getChannelRoute);
server.register(createChannelRoute);
server.register(updateChannelRoute);
server.register(deleteChannelRoute);

server.register(createFolderRoute);
server.register(deleteFolderRoute);
server.register(getFoldersRoute);
server.register(updateFolderRoute);
server.register(getOrganizationMetricsRoute);

server.register(getPostsRoute);

server.register(getIntegrationsRoute);

server.register(getOrganizationsRoute);
server.register(createOrganizationRoute);
server.register(getActiveOrganizationRoute);
server.register(setActiveOrganizationRoute);
server.register(getMembersRoute);
server.register(createInviteMemberRoute);
server.register(getPendingInvitesRoute);
server.register(acceptInviteRoute);
server.register(declineInviteRoute);
server.register(revokeInviteRoute);
// server.register(updateOrganizationRoute);

server.register(deleteIntegrationRoute)
server.register(requestYoutubeIntegrationUrlRoute)
server.register(youtubeCallbackRoute)
