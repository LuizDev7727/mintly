export type Project = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  status: "SUCCESS" | "PROCESSING" | "ENCODING" | "ERROR" | "CANCELED";
  runId: string;
  realtimeToken: string | null;
  createdAt: string;
  clipCount: number;
  owner: {
    name: string;
    avatarUrl: string | null;
  };
};
