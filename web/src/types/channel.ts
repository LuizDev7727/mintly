export type Channel = {
  id: string;
  name: string;
  slug: string;
  avatar: string | null;
  postsCount: number;
  integrationsCount: number;
  postsSize: { size: number }[];
  totalPostsSize: number;
};
