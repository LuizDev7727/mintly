import { env } from "../env.js";

export async function makeMintlyRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const url = `${env.MINTLY_API_URL}${path}`;

  const apiKey = env.MINTLY_API_KEY;

  const headers = {
    ...init?.headers,
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      ...init,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making Mintly request:", error);
    return null;
  }
}
