import { env } from "@/env.ts";
import { db } from "@/infra/db/client.ts";
import { integrationsTable } from "@/infra/db/tables/integrations.table.ts";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const ShortLivedTokenSchema = z.object({
  access_token: z.string().min(1, 'access_token é obrigatório'),
  user_id: z.union([z.string(), z.number()]).transform((val) => String(val)),
  permissions: z.array(z.string()).optional(), // algumas respostas incluem as permissões concedidas
});

const LongLivedTokenSchema = z.object({
  access_token: z.string().min(1, 'access_token é obrigatório'),
  token_type: z.string().optional(), // geralmente "bearer"
  expires_in: z.number().int().positive('expires_in deve ser positivo'),
});

const InstagramAccountType = z.enum(['BUSINESS', 'MEDIA_CREATOR', 'PERSONAL']);

const InstagramProfileSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
  username: z.string().min(1, 'username é obrigatório'),
  account_type: InstagramAccountType,
  media_count: z.number().int().nonnegative().optional(),
  name: z.string().optional(),
  profile_picture_url: z.url().optional(),
  followers_count: z.number().int().nonnegative().optional(),
  follows_count: z.number().int().nonnegative().optional(),
  biography: z.string().optional(),
  website: z.url().optional().or(z.literal('')), // website pode vir vazio
});

type ConnectInstagramParams = {
  code: string;
  channelId: string;
}

export async function connectInstagram(params: ConnectInstagramParams) {
  const { code, channelId } = params;

  const shortTokenParams = new URLSearchParams({
    client_id: env.INSTAGRAM_APP_ID,
    client_secret: env.INSTAGRAM_APP_SECRET,
    grant_type: 'authorization_code',
    redirect_uri: env.INSTAGRAM_REDIRECT_URI,
    code: code,
  });

  const shortTokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: shortTokenParams,
  });

  const shortTokenData = await shortTokenResponse.json();

  if (!shortTokenResponse.ok) {
    throw new Error(`Erro ao trocar code por token: ${JSON.stringify(shortTokenData)}`);
  }

  const { access_token: shortLivedToken, user_id, permissions } = ShortLivedTokenSchema.parse(shortTokenData)

  // 2. Trocar o token de curta duração por um de LONGA duração (válido por 60 dias)
  const longTokenUrl = new URL('https://graph.instagram.com/access_token');
  longTokenUrl.searchParams.set('grant_type', 'ig_exchange_token');
  longTokenUrl.searchParams.set('client_secret', env.INSTAGRAM_APP_SECRET);
  longTokenUrl.searchParams.set('access_token', shortLivedToken);

  const longTokenResponse = await fetch(longTokenUrl.toString());
  const longTokenData = await longTokenResponse.json();

  if (!longTokenResponse.ok) {
    throw new Error(`Erro ao gerar token de longa duração: ${JSON.stringify(longTokenData)}`);
  }

  const { access_token, expires_in, token_type } = LongLivedTokenSchema.parse(longTokenData);

  // 3. Buscar dados do perfil do usuário com o token de longa duração
  const profileUrl = new URL('https://graph.instagram.com/me');
  profileUrl.searchParams.set('fields', 'id,username,account_type,media_count,name,profile_picture_url');
  profileUrl.searchParams.set('access_token', access_token);

  const profileResponse = await fetch(profileUrl.toString());
  const profileData = await profileResponse.json();

  if (!profileResponse.ok) {
    throw new Error(`Erro ao buscar perfil: ${JSON.stringify(profileData)}`);
  }

  const {
    id,
    username,
    account_type,
    media_count,
    name,
    profile_picture_url: profilePictureUrl,
  } = InstagramProfileSchema.parse(profileData);

  const [existing] = await db
    .select({ id: integrationsTable.id })
    .from(integrationsTable)
    .where(
      and(
        eq(integrationsTable.channelId, channelId),
        eq(integrationsTable.provider, "INSTAGRAM"),
        eq(integrationsTable.name, username)
      ),
    );

  if (!existing) {
    await db.insert(integrationsTable).values({
      name: username,
      email: id,
      avatarUrl: profilePictureUrl,
      accessToken: access_token,
      refresh_token: "",
      expiry_in: expires_in,
      provider: "INSTAGRAM",
      channelId,
    });
  } else {
    await db
      .update(integrationsTable)
      .set({
        name: username,
        avatarUrl: profilePictureUrl,
        accessToken: access_token,
        refresh_token: "",
        expiry_in: expires_in,
        refreshExpiresIn: 0,
      })
      .where(eq(integrationsTable.id, existing.id));
  }


}
