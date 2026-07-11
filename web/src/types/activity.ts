export type Activity = {
  id: string
  action: "CREATED_CHANNEL" | "CREATED_POST" | "CANCELED_POST" | "DELETED_POST" | "CREATED_PROJECT" | "ADDED_INTEGRATION" | "DELETED_INTEGRATION" | "UPLOAD_INSPIRATIONAL_THUMBNAIL" | "DELETED_INSPIRATIONAL_THUMBNAIL"
  description: string
  createdAt: Date
  author: {
    name: string
    avatarUrl: string | null
  }
}
