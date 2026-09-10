import type { GenerateContentResponseUsageMetadata } from "@google/genai";

// gemini-2.5-flash-lite pricing (per 1M text tokens, in USD)
// https://ai.google.dev/gemini-api/docs/pricing
const PRICE_PER_MILLION_TOKENS_USD = {
  input: 0.1,
  cachedInput: 0.01,
  output: 0.4,
};

type CalculateGeminiCostParams = {
  usageMetadata: GenerateContentResponseUsageMetadata | undefined;
};

type CalculateGeminiCostResponse = {
  amount: number;
  currency: string;
};

export function calculateGeminiCost({
  usageMetadata,
}: CalculateGeminiCostParams): CalculateGeminiCostResponse {
  const {
    promptTokenCount = 0,
    candidatesTokenCount = 0,
    cachedContentTokenCount = 0,
    thoughtsTokenCount = 0,
  } = usageMetadata ?? {};

  const billableInputTokens = promptTokenCount - cachedContentTokenCount;
  // Gemini 2.5's "thinking" tokens are billed at the output rate, same as
  // the visible response tokens.
  const outputTokens = candidatesTokenCount + thoughtsTokenCount;

  const costInDollars =
    (billableInputTokens / 1_000_000) * PRICE_PER_MILLION_TOKENS_USD.input +
    (cachedContentTokenCount / 1_000_000) *
      PRICE_PER_MILLION_TOKENS_USD.cachedInput +
    (outputTokens / 1_000_000) * PRICE_PER_MILLION_TOKENS_USD.output;

  return {
    amount: costInDollars * 100,
    currency: "usd",
  };
}
