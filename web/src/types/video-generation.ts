export type VideoGenerationStatus =
  | "queued"
  | "generating"
  | "complete"
  | "error";

export type VideoGeneration = {
  id: string;
  prompt: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  status: VideoGenerationStatus;
  /** Epoch em ms. */
  createdAt: number;
  /** Duração do vídeo gerado, em segundos. `null` enquanto não termina. */
  durationSeconds: number | null;
};
