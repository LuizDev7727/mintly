export class FolderAlreadyExistsError extends Error {
  constructor() {
    super("Folder already exists");
  }
}
