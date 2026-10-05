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

export const PROJECT_STATUSES = [
  "SUCCESS",
  "PROCESSING",
  "ENCODING",
  "ERROR",
  "CANCELED",
] as const satisfies readonly Project["status"][];
