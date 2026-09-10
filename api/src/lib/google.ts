import { GoogleGenAI } from "@google/genai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

const apiKey = await getInfisicalSecret({ secretName: "GEMINI_API_KEY" });

export const googleAi = new GoogleGenAI({ apiKey });

// AI SDK-compatible provider (LanguageModelV2) — required by strategies like
// @polar-sh/ingestion's LLMStrategy, which don't work with the raw
// @google/genai client above.
export const google = createGoogleGenerativeAI({ apiKey });
