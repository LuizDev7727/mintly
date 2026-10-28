export class UnsupportedProviderError extends Error {
  constructor(message?: string) {
    super(message ?? "Provider not supported");
  }
}
