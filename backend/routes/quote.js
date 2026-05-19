const express = require("express");
const { sendQuoteEmails } = require("../services/email");
const { honeypotProtection } = require("../middleware/spam-protection");
const { optionalQuoteUpload } = require("../middleware/upload");
const { asyncHandler, validateQuote } = require("../middleware/validation");

const router = express.Router();

router.post(
  "/",
  optionalQuoteUpload,
  honeypotProtection,
  validateQuote,
  asyncHandler(async (req, res) => {
    await sendQuoteEmails(req.validatedBody, req.file);

    res.status(200).json({
      success: true,
      message:
        "Quote request received. Mico Industrial Press will review the details and follow up.",
      confirmationSent: Boolean(req.validatedBody.email),
      fileReceived: Boolean(req.file),
    });
  })
);

module.exports = router;
