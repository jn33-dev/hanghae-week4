class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "CustomError";
    this.status = status;
  }
}

const throwCustomError = (message, status) => {
  throw new CustomError(message, status);
};

module.exports = throwCustomError;
