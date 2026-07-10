export class OrganizationAlreadyCreatedError extends Error {
  constructor() {
    super("Organization already created");
  }
}
