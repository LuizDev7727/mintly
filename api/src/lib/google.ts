import { GoogleGenAI } from "@google/genai";
import { env } from "@/env.ts";

export const googleAi = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});
