export type Project = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  status: "SUCCESS" | "PROCESSING" | "SCHEDULED" | "ERROR" | "CANCELED";
  createdAt: string;
  clipCount: number;
  owner: {
    name: string;
    avatarUrl: string | null;
  };
};
