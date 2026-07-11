import { getPosts } from "@/functions/posts/get-posts.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getPostsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:orgSlug/channels/:channelId/posts",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
        }),
        querystring: z.object({
          titleFilter: z.string().nullable().default(null),
          pageIndex: z.coerce.number().int().min(0).default(0),
          folderId: z.uuidv7().nullable().default(null),
        }),
        response: {
          200: z.object({
            posts: z.array(
              z.object({
                id: z.string(),
                thumbnailUrl: z.string().nullable(),
                title: z.string(),
                size: z.number(),
                mimeType: z.string(),
                status: z.enum([
                  "PROCESSING",
                  "SCHEDULED",
                  "ERROR",
                  "PUBLISHED",
                  "ENCODING",
                  "GENERATING_METADATA",
                  "GENERATING_THUMBNAIL",
                  "TRANSCRIBING",
                  "SEO_GENERATING",
                  "PUBLISHING",
                ]),
                duration: z.number().optional(),
                publishedAt: z.string().optional(),
                socialsToPost: z.array(
                  z.object({
                    social: z.enum(["YOUTUBE", "TIKTOK"]),
                    socialName: z.string(),
                  }),
                ),
                author: z.object({
                  name: z.string(),
                }),
              }),
            ),
            meta: z.object({
              totalCount: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { titleFilter, pageIndex, folderId } = request.query;

      const span = tracer.startSpan("get-posts");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("title_filter", titleFilter ?? "No title filter");
      span.setAttribute("folder.id", folderId ?? "No selected folder");

      const { posts, meta } = await getPosts({
        channelId,
        folderId,
        pageIndex,
        titleFilter,
      });

      span.end();

      return reply.status(200).send({
        posts,
        meta,
      });
    },
  );
};
