const express = require("express");
const { sendContactEmails } = require("../services/email");
const { honeypotProtection } = require("../middleware/spam-protection");
const { asyncHandler, validateContact } = require("../middleware/validation");

const router = express.Router();

router.post(
  "/",
  honeypotProtection,
  validateContact,
  asyncHandler(async (req, res) => {
    await sendContactEmails(req.validatedBody);

    res.status(200).json({
      success: true,
      message:
        "Message received. Mico Industrial Press will respond as soon as possible.",
      confirmationSent: Boolean(req.validatedBody.email),
    });
  })
);

module.exports = router;
