import { describe, test, expect, vi } from "vitest";
import { retryOnRateLimit } from "@/utils/infisical/retry-on-rate-limit.ts";

const rateLimitError = (seconds?: number) =>
  new Error(
    `[URL=https://app.infisical.com/api/v3/secrets/raw/X] [Method=GET] [StatusCode=429] Rate limit exceeded.${
      seconds === undefined ? "" : ` Please try again in ${seconds} seconds`
    }`,
  );

const noJitter = () => 0;

describe("retryOnRateLimit", () => {
  test("should return the result without sleeping when the call succeeds", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const operation = vi.fn(async () => "ok");

    await expect(retryOnRateLimit(operation, { sleep })).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  test("should retry a 429 and wait as long as the server asks", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(rateLimitError(11))
      .mockRejectedValueOnce(rateLimitError(29))
      .mockResolvedValue("ok");

    await expect(
      retryOnRateLimit(operation, { sleep, random: noJitter }),
    ).resolves.toBe("ok");
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([11_000, 29_000]);
  });

  test("should back off exponentially when the server gives no hint", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(rateLimitError())
      .mockRejectedValueOnce(rateLimitError())
      .mockResolvedValue("ok");

    await retryOnRateLimit(operation, { sleep, random: noJitter });

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([2_000, 4_000]);
  });

  test("should cap the wait at 60 seconds", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(rateLimitError(300))
      .mockResolvedValue("ok");

    await retryOnRateLimit(operation, { sleep, random: noJitter });

    expect(sleep).toHaveBeenCalledWith(60_000);
  });

  test("should add jitter to the wait", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(rateLimitError(10))
      .mockResolvedValue("ok");

    await retryOnRateLimit(operation, { sleep, random: () => 0.5 });

    expect(sleep).toHaveBeenCalledWith(10_500);
  });

  test("should not retry errors that are not rate limits", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const failure = new Error("[StatusCode=401] Unauthorized");
    const operation = vi.fn(async () => {
      throw failure;
    });

    await expect(retryOnRateLimit(operation, { sleep })).rejects.toBe(failure);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  test("should give up and rethrow after maxAttempts", async () => {
    const sleep = vi.fn(async (_ms: number) => {});
    const failure = rateLimitError(1);
    const operation = vi.fn(async () => {
      throw failure;
    });

    await expect(
      retryOnRateLimit(operation, { maxAttempts: 3, sleep, random: noJitter }),
    ).rejects.toBe(failure);
    expect(operation).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});
