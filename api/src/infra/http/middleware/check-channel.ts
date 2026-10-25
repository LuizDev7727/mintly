import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { UnauthorizedError } from "@/errors/unauthorized.error.ts";
import { db } from "@/infra/db/client.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { and, eq } from "drizzle-orm";
import type { FastifyRequest, onRouteHookHandler } from "fastify";

type CheckChannelProps = {
  organizationSlug: string;
  channelId: string;
};

// Garante que o canal da URL pertence à organização da URL. Um canal de outra
// organização é reportado exatamente como um canal inexistente, para a resposta
// não revelar que o id existe.
export async function checkChannel(props: CheckChannelProps) {
  const { organizationSlug, channelId } = props;

  const [channel] = await db
    .select({ id: channelsTable.id })
    .from(channelsTable)
    .where(
      and(
        eq(channelsTable.id, channelId),
        eq(channelsTable.organizationSlug, organizationSlug),
      ),
    )
    .limit(1);

  if (!channel) {
    throw new ResourceNotFoundError("Channel not found");
  }
}

type ChannelRouteParams = {
  slug?: string;
  orgSlug?: string;
  channelId?: string;
};

async function checkChannelOfRequest(request: FastifyRequest) {
  const { slug, orgSlug, channelId } = request.params as ChannelRouteParams;
  const organizationSlug = slug ?? orgSlug;

  if (!organizationSlug || !channelId) {
    return;
  }

  // Esta guarda roda depois do `checkUserSession` da própria rota. Se não há
  // usuário, a rota esqueceu de autenticar: falha fechado em vez de seguir.
  if (!request.user) {
    throw new UnauthorizedError();
  }

  // Mantém a ordem de erros de sempre: quem não é da organização recebe o erro
  // de membership antes de qualquer informação sobre o canal.
  await checkMembership({ organizationSlug, userId: request.user.id });
  await checkChannel({ organizationSlug, channelId });
}

const CHANNEL_ROUTE_PATTERN =
  /^\/api\/organizations\/:(slug|orgSlug)\/channels\/:channelId(\/|$)/;

// Hook global (registrado no `app.ts` antes das rotas): toda rota
// `/api/organizations/:slug/channels/:channelId/...` ganha a checagem de canal
// automaticamente, inclusive as que forem criadas no futuro.
export const protectChannelRoutes: onRouteHookHandler = (routeOptions) => {
  if (!CHANNEL_ROUTE_PATTERN.test(routeOptions.url)) {
    return;
  }

  const current = routeOptions.preHandler;
  const handlers = Array.isArray(current) ? current : current ? [current] : [];

  routeOptions.preHandler = [...handlers, checkChannelOfRequest];
};
