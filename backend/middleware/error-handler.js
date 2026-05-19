const { AppError } = require("./validation");

const notFoundHandler = (req, _res, next) => {
  next(new AppError("Route not found.", 404));
};

const errorHandler = (error, _req, res, _next) => {
  const rawStatusCode = error.statusCode || error.status || 500;
  const statusCode =
    Number.isInteger(rawStatusCode) && rawStatusCode >= 400 && rawStatusCode <= 599
      ? rawStatusCode
      : 500;
  const isOperational = error instanceof AppError || statusCode < 500;

  if (!isOperational) {
    console.error("Unhandled API error:", {
      name: error.name,
      message: error.message,
      statusCode,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational
      ? error.message
      : "Something went wrong. Please try again or contact Mico Industrial Press directly.",
    errors: error.details || undefined,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
