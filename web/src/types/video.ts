export type Video = {
  id: string;
  filename: string | null;
  status: "READY" | "GENERATING" | "FAILED";
  createdAt: string;
};
