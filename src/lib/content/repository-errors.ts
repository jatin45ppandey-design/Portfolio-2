export class PortfolioContentRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class PortfolioStateNotFoundError extends PortfolioContentRepositoryError {
  constructor() {
    super("Portfolio state is not initialized.");
  }
}

export class PublishedPortfolioNotFoundError extends PortfolioContentRepositoryError {
  constructor() {
    super("No published portfolio revision is available.");
  }
}

export class InvalidStoredPortfolioPayloadError extends PortfolioContentRepositoryError {
  constructor(source: "draft" | "published" | "historical") {
    super(`The stored ${source} portfolio content is invalid.`);
  }
}

export class PortfolioRevisionNotFoundError extends PortfolioContentRepositoryError {
  constructor() {
    super("The requested portfolio revision does not exist.");
  }
}

export class InvalidPortfolioDocumentError extends PortfolioContentRepositoryError {
  constructor() {
    super("The submitted portfolio content is invalid.");
  }
}

export class InvalidDraftVersionError extends PortfolioContentRepositoryError {
  constructor() {
    super("The draft version is invalid.");
  }
}

export class InvalidPortfolioActorError extends PortfolioContentRepositoryError {
  constructor() {
    super("The authenticated portfolio owner is invalid.");
  }
}

export class DraftVersionConflictError extends PortfolioContentRepositoryError {
  constructor() {
    super("This draft was changed elsewhere. Refresh it and try again.");
  }
}

export class RevisionVersionConflictError extends PortfolioContentRepositoryError {
  constructor() {
    super("The portfolio changed while publishing. Refresh it and try again.");
  }
}
