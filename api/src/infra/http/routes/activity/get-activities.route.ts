import { getActivities } from "@/functions/activity/get-activities.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getActivitiesRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/activities",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            activities: z.array(
              z.object({
                id: z.string(),
                action: z.enum([
                  "CREATED_CHANNEL",
                  "CREATED_POST",
                  "CANCELED_POST",
                  "DELETED_POST",
                  "CREATED_PROJECT",
                  "ADDED_INTEGRATION",
                  "DELETED_INTEGRATION",
                  "UPLOAD_INSPIRATIONAL_THUMBNAIL",
                  "DELETED_INSPIRATIONAL_THUMBNAIL",
                ]),
                description: z.string(),
                createdAt: z.date(),
                author: z.object({
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            ),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { cursor } = request.query;

      const span = tracer.startSpan("get-activities");
      span.setAttribute("organization.slug", slug);

      const { activities, nextCursor } = await getActivities({
        orgSlug: slug,
        cursor,
      });

      span.setAttribute("activities-count", activities.length);
      span.end();

      return reply.status(200).send({ activities, nextCursor });
    },
  );
};
