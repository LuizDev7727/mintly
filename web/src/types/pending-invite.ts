import type { MemberRole } from "./member";

export type PendingInvite = {
  id: string;
  email: string;
  role: MemberRole | null;
  createdAt: string;
};
