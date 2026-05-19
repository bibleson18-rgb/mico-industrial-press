class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeText).filter(Boolean);
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return String(value)
    .split(",")
    .map(normalizeText)
    .filter(Boolean);
};

const sanitizeFields = (body) => {
  const sanitized = {};

  Object.entries(body || {}).forEach(([key, value]) => {
    const safeKey = normalizeText(key);

    if (!safeKey) {
      return;
    }

    sanitized[safeKey] = Array.isArray(value)
      ? normalizeArray(value)
      : normalizeText(value);
  });

  return sanitized;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isUsefulPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");

  return digits.length >= 7 && digits.length <= 15;
};

const collectMissingFields = (body, requiredFields) =>
  requiredFields.filter((field) => !body[field]);

const validateEmailIfProvided = (body, errors) => {
  if (body.email && !isValidEmail(body.email)) {
    errors.email = "Please provide a valid email address.";
  }
};

const validatePhoneIfProvided = (body, errors) => {
  if (body.phone && !isUsefulPhone(body.phone)) {
    errors.phone = "Please provide a reachable phone number.";
  }
};

const validateQuote = (req, _res, next) => {
  const body = sanitizeFields(req.body);
  const errors = {};

  collectMissingFields(body, [
    "fullName",
    "phone",
    "serviceNeeded",
    "quantity",
    "message",
  ]).forEach((field) => {
    errors[field] = "This field is required.";
  });

  validateEmailIfProvided(body, errors);
  validatePhoneIfProvided(body, errors);

  if (body.message && body.message.length < 10) {
    errors.message = "Please describe the print job in a little more detail.";
  }

  if (Object.keys(errors).length > 0) {
    return next(
      new AppError("Please check the highlighted fields.", 400, errors)
    );
  }

  req.validatedBody = {
    fullName: body.fullName,
    phone: body.phone,
    email: body.email || "",
    organization: body.organization || "",
    serviceNeeded: body.serviceNeeded,
    quantity: body.quantity,
    dimensions: body.dimensions || "",
    material: body.material || "",
    color: body.color || "",
    sides: body.sides || "",
    finishing: normalizeArray(body.finishing),
    deadline: body.deadline || "",
    handover: body.handover || "",
    budget: body.budget || "",
    message: body.message,
  };

  return next();
};

const validateContact = (req, _res, next) => {
  const body = sanitizeFields(req.body);
  const errors = {};
  const name = body.fullName || body.name || "";

  if (!name) {
    errors.fullName = "Please provide your name.";
  }

  if (!body.email && !body.phone) {
    errors.contact = "Please provide a phone number or email address.";
  }

  if (!body.message) {
    errors.message = "Please enter your message.";
  }

  validateEmailIfProvided(body, errors);
  validatePhoneIfProvided(body, errors);

  if (body.message && body.message.length < 10) {
    errors.message = "Please enter a little more detail.";
  }

  if (Object.keys(errors).length > 0) {
    return next(
      new AppError("Please check the highlighted fields.", 400, errors)
    );
  }

  req.validatedBody = {
    fullName: name,
    phone: body.phone || "",
    email: body.email || "",
    subject: body.subject || "Website contact message",
    message: body.message,
  };

  return next();
};

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = {
  AppError,
  asyncHandler,
  normalizeArray,
  normalizeText,
  sanitizeFields,
  validateContact,
  validateQuote,
};
