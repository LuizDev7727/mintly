export type VideoGenerationStatus =
  | "queued"
  | "generating"
  | "complete"
  | "error";

export type VideoGeneration = {
  id: string;
  prompt: string;
  status: VideoGenerationStatus;
  /** Epoch em ms. */
  createdAt: number;
  /** Duração do vídeo gerado, em segundos. `null` enquanto não termina. */
  durationSeconds: number | null;
};
