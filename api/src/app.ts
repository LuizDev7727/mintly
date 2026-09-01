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
import { getHealthRoute } from "./infra/http/routes/internal/health/get-health.route.ts";
import { authRoute } from "./infra/http/routes/internal/auth/auth.route.ts";
import { getChannelsRoute } from "./infra/http/routes/internal/channel/get-channels.route.ts";
import { getChannelRoute } from "./infra/http/routes/internal/channel/get-channel.route.ts";
import { createChannelRoute } from "./infra/http/routes/internal/channel/create-channel.route.ts";
import { updateChannelRoute } from "./infra/http/routes/internal/channel/update-channel.route.ts";
import { deleteChannelRoute } from "./infra/http/routes/internal/channel/delete-channel.route.ts";
import { createFolderRoute } from "./infra/http/routes/internal/folder/create-folder.route.ts";
import { deleteFolderRoute } from "./infra/http/routes/internal/folder/delete-folder.route.ts";
import { getFoldersRoute } from "./infra/http/routes/internal/folder/get-folders.route.ts";
import { updateFolderRoute } from "./infra/http/routes/internal/folder/update-folder.route.ts";
import { getStarredFoldersRoute } from "./infra/http/routes/internal/folder/get-starred-folders.route.ts";
import { setStarredFolderRoute } from "./infra/http/routes/internal/folder/set-starred-folder.route.ts";
import { removeStarredFolderRoute } from "./infra/http/routes/internal/folder/remove-starred-folder.route.ts";
import { getOrganizationOverviewRoute } from "./infra/http/routes/internal/organization/get-overview.route.ts";
import { getWebhooksOverviewRoute } from "./infra/http/routes/internal/webhook/get-webhooks-overview.route.ts";
import { getAvailableEventsRoute } from "./infra/http/routes/internal/webhook/get-available-events.route.ts";
import { createWebhookRoute } from "./infra/http/routes/internal/webhook/create-webhook.route.ts";
import { handleWebhookEventRoute } from "./infra/http/routes/internal/webhook/handle-webhook-event.route.ts";
import { getPostsRoute } from "./infra/http/routes/internal/post/get-posts.route.ts";
import { getPostRoute } from "./infra/http/routes/internal/post/get-post.route.ts";
import { createPostsRoute } from "./infra/http/routes/internal/post/create-posts.route.ts";
import { cancelPostRoute } from "./infra/http/routes/internal/post/cancel-post.route.ts";
import { movePostsToFolderRoute } from "./infra/http/routes/internal/post/move-posts-to-folder.route.ts";
import { getProjectsRoute } from "./infra/http/routes/internal/project/get-projects.route.ts";
import { getProjectRoute } from "./infra/http/routes/internal/project/get-project.route.ts";
import { createProjectRoute } from "./infra/http/routes/internal/project/create-project.route.ts";
import { getBestMomentsRoute } from "./infra/http/routes/internal/best-moment/get-best-moments.route.ts";
import { sendBestMomentToSocialMediaRoute } from "./infra/http/routes/internal/best-moment/send-best-moment-to-social-media.route.ts";
import { getIntegrationsRoute } from "./infra/http/routes/internal/integration/get-integrations.route.ts";
import { getOrganizationsRoute } from "./infra/http/routes/internal/organization/get-organizations.route.ts";
import { getActiveOrganizationRoute } from "./infra/http/routes/internal/organization/get-active-organization.route.ts";
import { setActiveOrganizationRoute } from "./infra/http/routes/internal/organization/set-active-organization.route.ts";
import { createOrganizationRoute } from "./infra/http/routes/internal/organization/create-organization.route.ts";
import { getMembersRoute } from "./infra/http/routes/internal/organization/get-members.route.ts";
import { createInviteMemberRoute } from "./infra/http/routes/internal/organization/create-invite-member.route.ts";
import { getPendingInvitesRoute } from "./infra/http/routes/internal/invitation/get-pending-invites.route.ts";
import { acceptInviteRoute } from "./infra/http/routes/internal/invitation/accept-invite.route.ts";
import { declineInviteRoute } from "./infra/http/routes/internal/invitation/decline-invite.route.ts";
import { revokeInviteRoute } from "./infra/http/routes/internal/organization/revoke-invite.route.ts";
import { updateOrganizationRoute } from "./infra/http/routes/internal/organization/update-organization.route.ts";
import { requestYoutubeIntegrationUrlRoute } from "./infra/http/routes/internal/integration/request-youtube-integration-url.route.ts";
import { youtubeCallbackRoute } from "./infra/http/routes/internal/integration/youtube-callback.route.ts";
import { deleteIntegrationRoute } from "./infra/http/routes/internal/integration/delete-integration.route.ts";
import { getActivitiesRoute } from "./infra/http/routes/internal/activity/get-activities.route.ts";
import { addInspirationalThumbnailRoute } from "./infra/http/routes/internal/inspirational-thumbnail/add-inspirational-thumbnail.route.ts";
import { getInspirationalThumbnailsRoute } from "./infra/http/routes/internal/inspirational-thumbnail/get-inspirational-thumbnails.route.ts";
import { deleteInspirationalThumbnailRoute } from "./infra/http/routes/internal/inspirational-thumbnail/delete-inspirational-thumbnail.route.ts";
import { presignUploadRoute } from "./infra/http/routes/internal/upload/presign-upload.route.ts";
import { completeMultipartUploadRoute } from "./infra/http/routes/internal/upload/complete-multipart-upload.route.ts";
import { abortMultipartUploadRoute } from "./infra/http/routes/internal/upload/abort-multipart-upload.route.ts";
import { listMultipartUploadPartsRoute } from "./infra/http/routes/internal/upload/list-multipart-upload-parts.route.ts";
import { requestTiktokIntegrationUrlRoute } from "./infra/http/routes/internal/integration/request-tiktok-integration-url.route.ts";
import { tiktokCallbackRoute } from "./infra/http/routes/internal/integration/tiktok-callback.route.ts";
import { requestInstagramIntegrationUrlRoute } from "./infra/http/routes/internal/integration/request-instagram-integration-url.route.ts";
import { instagramCallbackRoute } from "./infra/http/routes/internal/integration/instagram-callback.route.ts";
import { getProjectsExternalRoute } from "./infra/http/routes/external/get-projects.route.ts";

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
server.register(getStarredFoldersRoute);
server.register(setStarredFolderRoute);
server.register(removeStarredFolderRoute);
server.register(getOrganizationOverviewRoute);
server.register(getWebhooksOverviewRoute);
server.register(getAvailableEventsRoute);
server.register(createWebhookRoute);
server.register(handleWebhookEventRoute);

server.register(getPostsRoute);
server.register(getPostRoute);
server.register(createPostsRoute);
server.register(cancelPostRoute);
server.register(movePostsToFolderRoute);
server.register(getProjectsRoute);
server.register(getProjectRoute);
server.register(createProjectRoute);
server.register(getBestMomentsRoute);
server.register(sendBestMomentToSocialMediaRoute);

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
server.register(updateOrganizationRoute);

server.register(deleteIntegrationRoute)
server.register(requestYoutubeIntegrationUrlRoute)
server.register(youtubeCallbackRoute)
server.register(requestTiktokIntegrationUrlRoute)
server.register(tiktokCallbackRoute)
server.register(requestInstagramIntegrationUrlRoute)
server.register(instagramCallbackRoute)

server.register(getActivitiesRoute);

server.register(addInspirationalThumbnailRoute);
server.register(getInspirationalThumbnailsRoute);
server.register(deleteInspirationalThumbnailRoute);

server.register(presignUploadRoute);
server.register(completeMultipartUploadRoute);
server.register(abortMultipartUploadRoute);
server.register(listMultipartUploadPartsRoute);

server.register(getProjectsExternalRoute);
