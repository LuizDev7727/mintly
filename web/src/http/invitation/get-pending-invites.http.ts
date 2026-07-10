import { api } from "../api";

export type GetPendingInvitesResponse = {
  invites: {
    id: string;
    role: string | null;
    createdAt: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    };
    author: {
      name: string;
      avatarUrl: string | null;
    };
  }[];
};

export async function getPendingInvitesHttp(): Promise<GetPendingInvitesResponse> {
  const { data } = await api.get<GetPendingInvitesResponse>(
    "/invitations/pending",
  );
  return data;
}
