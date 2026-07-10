export type MemberRole = "owner" | "admin" | "member";

export type Member = {
  id: string;
  role: MemberRole;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
};
