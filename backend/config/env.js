require("dotenv").config();

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === "") {
    return fallback;
  }

  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const toPositiveNumber = (value, fallback) => {
  const parsed = toNumber(value, fallback);

  return parsed > 0 ? parsed : fallback;
};

const toList = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toPositiveNumber(process.env.PORT, 3001),
  frontendOrigins: toList(process.env.FRONTEND_ORIGIN, ["http://localhost:3000"]),
  businessEmail: process.env.BUSINESS_EMAIL || "micoindustrial@yahoo.com",
  businessName: process.env.BUSINESS_NAME || "Mico Industrial Press",
  businessPhone: process.env.BUSINESS_PHONE || "08037400918",
  businessAddress:
    process.env.BUSINESS_ADDRESS ||
    "No 24 Zik Avenue Amawbia, Awka-South L.G.A, Anambra State",
  smtp: {
    host: process.env.SMTP_HOST,
    port: toPositiveNumber(process.env.SMTP_PORT, 587),
    secure: toBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
  },
  uploads: {
    enabled: toBoolean(process.env.UPLOADS_ENABLED, false),
    maxSize: toPositiveNumber(process.env.MAX_UPLOAD_SIZE, 5 * 1024 * 1024),
    maxFieldSize: toPositiveNumber(process.env.MAX_UPLOAD_FIELD_SIZE, 100 * 1024),
  },
  rateLimit: {
    windowMs: toPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toPositiveNumber(process.env.RATE_LIMIT_MAX, 30),
  },
  jsonLimit: process.env.JSON_BODY_LIMIT || "100kb",
  honeypotField: process.env.HONEYPOT_FIELD || "website",
};

module.exports = config;
