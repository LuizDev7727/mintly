import { getFolders } from "@/functions/folder/get-folders.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getFoldersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:orgSlug/channels/:channelId/folders",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.coerce.number().int().min(0).default(0),
          folderId: z.uuidv7().nullable().default(null),
        }),
        response: {
          200: z.object({
            folders: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                postsCount: z.number(),
              }),
            ),
            parent: z
              .object({
                id: z.string(),
                title: z.string(),
              })
              .nullable(),
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
      const { pageIndex, folderId } = request.query;

      const span = tracer.startSpan("get-folders");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("folder.name", folderId ?? "No selected folder");

      const { folders, parent, meta } = await getFolders({
        channelId,
        folderId,
        pageIndex,
      });

      span.end();

      return reply.status(200).send({ folders, parent, meta });
    },
  );
};
