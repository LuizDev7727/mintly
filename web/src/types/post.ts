export type PostDetails = {
  title: string;
  thumbnailUrl: string | null;
  description: string;
  createdAt: string;
  size: number;
  duration: number;
  status: Post["status"];
  author: {
    name: string;
    avatarUrl: string | null;
  };
  socialsToPost: { socialName: string; social: "YOUTUBE" | "TIKTOK" }[];
};

export type Post = {
  id: string;
  thumbnailUrl: string | null;
  title: string;
  size: number;
  type: string;
  runId: string;
  status:
    | "PROCESSING"
    | "SCHEDULED"
    | "ERROR"
    | "PUBLISHED"
    | "ENCODING"
    | "GENERATING_METADATA"
    | "GENERATING_THUMBNAIL"
    | "TRANSCRIBING"
    | "SEO_GENERATING"
    | "PUBLISHING"
    | "CANCELED";
  duration: number | null;
  publishAt: Date | null;
  socialsToPost: { id: string; socialName: string; social: "YOUTUBE" | "TIKTOK" }[];
  author: {
    name: string;
    avatarUrl: string | null;
  };
};
