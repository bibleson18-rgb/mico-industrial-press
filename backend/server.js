const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/env");
const quoteRouter = require("./routes/quote");
const contactRouter = require("./routes/contact");
const { apiRateLimiter } = require("./middleware/spam-protection");
const { AppError } = require("./middleware/validation");
const { errorHandler, notFoundHandler } = require("./middleware/error-handler");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

const corsOptions = {
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
  origin(origin, callback) {
    const allowedOrigins = config.frontendOrigins;
    const allowAnyOrigin =
      config.nodeEnv !== "production" && allowedOrigins.includes("*");

    if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new AppError("This origin is not allowed to access the API.", 403)
    );
  },
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: config.jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: config.jsonLimit }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    service: "Mico Industrial Press API",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRateLimiter);
app.use("/api/quote", quoteRouter);
app.use("/api/contact", contactRouter);

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Mico Industrial Press API running on port ${config.port}`);
  });
}

module.exports = app;
