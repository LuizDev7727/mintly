import { GoogleGenAI } from "@google/genai";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

export const googleAi = new GoogleGenAI({
  apiKey: await getInfisicalSecret({ secretName: "GEMINI_API_KEY" }),
});
