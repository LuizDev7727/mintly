export class ChannelAlreadyExistsError extends Error {
  constructor() {
    super("Channel already exists");
  }
}
