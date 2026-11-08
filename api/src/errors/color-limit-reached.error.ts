export class ColorLimitReachedError extends Error {
  constructor() {
    super("Color limit reached for this channel");
  }
}
