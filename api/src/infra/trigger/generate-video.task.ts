import { logger, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";

export const generateVideoTask = schemaTask({
  id: "generate-video",
  schema: z.object({
    prompt: z.string(),
    imageUrl: z.url(),
  }),
  maxDuration: 600,
  run: async (payload) => {
    const { prompt, imageUrl } = payload;

    logger.log("Starting video generation", { prompt, imageUrl });

    // TODO: chamar o provedor de IA, salvar o vídeo no R2 e atualizar o status
    // do registro em `videos` (READY/FAILED). Para isso o payload vai precisar
    // do `videoId`.
  },
});
