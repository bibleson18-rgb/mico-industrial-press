const multer = require("multer");
const path = require("path");
const config = require("../config/env");
const { AppError } = require("./validation");

const allowedExtensions = new Set([".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.memoryStorage();
const maxMultipartFields = 25;

const multipartLimits = {
  fieldSize: config.uploads.maxFieldSize,
  fields: maxMultipartFields,
  files: 1,
  parts: maxMultipartFields + 1,
};

const upload = multer({
  storage,
  limits: {
    ...multipartLimits,
    fileSize: config.uploads.maxSize,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.mimetype)) {
      return callback(
        new AppError(
          "Please upload a PDF, JPG, PNG, DOC, or DOCX file.",
          400,
          { artwork: "Unsupported file type." }
        )
      );
    }

    return callback(null, true);
  },
});

const optionalQuoteUpload = (req, res, next) => {
  const isMultipart = req.is("multipart/form-data");

  if (!isMultipart) {
    return next();
  }

  const handler = config.uploads.enabled
    ? upload.single("artwork")
    : multer({
        limits: {
          ...multipartLimits,
          files: 0,
          parts: maxMultipartFields,
        },
      }).none();

  return handler(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (
        (error.code === "LIMIT_UNEXPECTED_FILE" || error.code === "LIMIT_FILE_COUNT") &&
        !config.uploads.enabled
      ) {
        return next(
          new AppError(
            "File uploads are not enabled yet. Please submit the form without a file or use WhatsApp.",
            400,
            { artwork: "File upload is disabled." }
          )
        );
      }

      if (error.code === "LIMIT_FILE_SIZE") {
        return next(
          new AppError(
            "The uploaded file is too large.",
            400,
            { artwork: `Maximum file size is ${config.uploads.maxSize} bytes.` }
          )
        );
      }

      if (
        error.code === "LIMIT_FIELD_COUNT" ||
        error.code === "LIMIT_FIELD_VALUE" ||
        error.code === "LIMIT_FIELD_KEY" ||
        error.code === "LIMIT_PART_COUNT"
      ) {
        return next(
          new AppError(
            "The submitted form is too large. Please reduce the details or contact Mico Industrial Press directly.",
            400
          )
        );
      }
    }

    return next(error);
  });
};

module.exports = {
  allowedExtensions,
  optionalQuoteUpload,
};
