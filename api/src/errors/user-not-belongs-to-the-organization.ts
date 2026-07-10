export class UserNotBelongsToTheOrganizationError extends Error {
  constructor() {
    super("User not belongs to the organization");
  }
}
