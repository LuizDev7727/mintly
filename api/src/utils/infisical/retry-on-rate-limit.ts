type RetryOnRateLimitOptions = {
  maxAttempts?: number;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
};

const DEFAULT_MAX_ATTEMPTS = 6;
const MAX_WAIT_MS = 60_000;

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Returns how long to wait before retrying, or null when the error is not a
// rate-limit error. The Infisical SDK puts the status in the message, e.g.
// "[StatusCode=429] Rate limit exceeded. Please try again in 11 seconds".
function readRateLimitWaitMs(error: unknown, attempt: number): number | null {
  const message = error instanceof Error ? error.message : "";
  const isRateLimit =
    message.includes("StatusCode=429") || /rate limit exceeded/i.test(message);

  if (!isRateLimit) return null;

  const hint = /try again in (\d+) seconds?/i.exec(message);
  const seconds = hint ? Number(hint[1]) : 2 ** attempt;

  return Math.min(seconds * 1000, MAX_WAIT_MS);
}

export async function retryOnRateLimit<T>(
  operation: () => Promise<T>,
  options: RetryOnRateLimitOptions = {},
): Promise<T> {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const waitMs = readRateLimitWaitMs(error, attempt);

      if (waitMs === null || attempt >= maxAttempts) {
        throw error;
      }

      // Jitter, so callers that were limited together do not retry together.
      await sleep(waitMs + Math.floor(random() * 1000));
    }
  }
}
