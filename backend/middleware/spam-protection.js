const rateLimit = require("express-rate-limit");
const config = require("../config/env");
const { AppError } = require("./validation");

const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please wait a few minutes and try again.",
  },
});

const honeypotProtection = (req, _res, next) => {
  const honeypotValue = req.body?.[config.honeypotField];

  if (honeypotValue) {
    return next(new AppError("Unable to process this request.", 400));
  }

  return next();
};

module.exports = {
  apiRateLimiter,
  honeypotProtection,
};
