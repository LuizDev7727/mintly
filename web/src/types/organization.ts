export type Organization = {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  billingEmail: string;
  membersCount: number;
};
