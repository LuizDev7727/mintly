export type Post = {
  id: string;
  thumbnailUrl: string | null;
  title: string;
  size: number;
  type: string;
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
    | "PUBLISHING";
  duration: number | null;
  publishAt: Date | null;
  socialsToPost: { id: string; socialName: string; social: "YOUTUBE" | "TIKTOK" }[];
  author: {
    name: string;
    avatarUrl: string | null;
  };
};
