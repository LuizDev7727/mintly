import type { Activity } from "@/types/activity";
import {
  Ban,
  Clapperboard,
  ImageOff,
  ImagePlus,
  Trash2,
  TvMinimal,
  Unlink,
  Video,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const ACTIVITY_ACTIONS = [
  "CREATED_CHANNEL",
  "CREATED_POST",
  "CANCELED_POST",
  "DELETED_POST",
  "CREATED_PROJECT",
  "ADDED_INTEGRATION",
  "DELETED_INTEGRATION",
  "UPLOAD_INSPIRATIONAL_THUMBNAIL",
  "DELETED_INSPIRATIONAL_THUMBNAIL",
] as const;

export const ACTIVITY_ACTION_CONFIG: Record<
  Activity["action"],
  { label: string; icon: LucideIcon }
> = {
  CREATED_CHANNEL: { label: "created a channel", icon: TvMinimal },
  CREATED_POST: { label: "created a post", icon: Video },
  CANCELED_POST: { label: "canceled a post", icon: Ban },
  DELETED_POST: { label: "deleted a post", icon: Trash2 },
  CREATED_PROJECT: { label: "created a project", icon: Clapperboard },
  ADDED_INTEGRATION: { label: "connected an integration", icon: Workflow },
  DELETED_INTEGRATION: { label: "disconnected an integration", icon: Unlink },
  UPLOAD_INSPIRATIONAL_THUMBNAIL: {
    label: "uploaded an inspirational thumbnail",
    icon: ImagePlus,
  },
  DELETED_INSPIRATIONAL_THUMBNAIL: {
    label: "deleted an inspirational thumbnail",
    icon: ImageOff,
  },
};
