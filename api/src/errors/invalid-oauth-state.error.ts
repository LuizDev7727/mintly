export class InvalidOAuthStateError extends Error {
  constructor(message?: string) {
    super(message ?? "Invalid or expired OAuth state");
  }
}
