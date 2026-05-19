const nodemailer = require("nodemailer");
const path = require("path");
const config = require("../config/env");
const { AppError } = require("../middleware/validation");

const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value) =>
  String(value || "").replace(/[&<>"']/g, (character) => htmlEntities[character]);

const EMAIL_SETUP_MESSAGE =
  "Email sending is not configured yet. Please call 08037400918 or use WhatsApp.";

const EMAIL_SEND_MESSAGE =
  "Email could not be sent right now. Please call 08037400918 or use WhatsApp.";

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.map(escapeHtml).join(", ") : "Not provided";
  }

  return value ? escapeHtml(value) : "Not provided";
};

const getMissingSmtpFields = () => {
  const missing = [];

  if (!config.smtp.host) missing.push("SMTP_HOST");
  if (!config.smtp.user) missing.push("SMTP_USER");
  if (!config.smtp.pass) missing.push("SMTP_PASS");
  if (!config.smtp.from) missing.push("SMTP_FROM");

  return missing;
};

const assertSmtpConfigured = () => {
  const missing = getMissingSmtpFields();

  if (missing.length > 0) {
    console.warn(
      `Email sending is disabled because SMTP configuration is incomplete. Missing: ${missing.join(", ")}`
    );
    throw new AppError(EMAIL_SETUP_MESSAGE, 503);
  }
};

const createTransporter = () => {
  assertSmtpConfigured();

  const transportConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  };

  return nodemailer.createTransport(transportConfig);
};

const buildRows = (rows) =>
  rows
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" style="padding: 10px 12px; background: #f5f7f8; border-bottom: 1px solid #d8dde2; color: #182734; font-family: Arial, sans-serif; font-size: 14px; width: 34%;">${escapeHtml(label)}</th>
          <td style="padding: 10px 12px; border-bottom: 1px solid #d8dde2; color: #111820; font-family: Arial, sans-serif; font-size: 14px;">${formatValue(value)}</td>
        </tr>`
    )
    .join("");

const baseEmailTemplate = ({ title, intro, rows, footer }) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin: 0; padding: 0; background: #f5f7f8;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f5f7f8; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; background: #ffffff; border: 1px solid #d8dde2;">
              <tr>
                <td style="padding: 24px; background: #182734;">
                  <p style="margin: 0 0 6px; color: #f1c365; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase;">${escapeHtml(config.businessName)}</p>
                  <h1 style="margin: 0; color: #ffffff; font-family: Arial, sans-serif; font-size: 26px; line-height: 1.25;">${escapeHtml(title)}</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px;">
                  <p style="margin: 0 0 18px; color: #344252; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6;">${escapeHtml(intro)}</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #d8dde2; border-bottom: 0;">
                    ${buildRows(rows)}
                  </table>
                  <p style="margin: 18px 0 0; color: #64707d; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6;">${escapeHtml(footer)}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const quoteRows = (quote) => [
  ["Customer name", quote.fullName],
  ["Phone", quote.phone],
  ["Email", quote.email],
  ["Company / organization", quote.organization],
  ["Service needed", quote.serviceNeeded],
  ["Quantity", quote.quantity],
  ["Size / dimensions", quote.dimensions],
  ["Material / paper type", quote.material],
  ["Colour preference", quote.color],
  ["Sides", quote.sides],
  ["Finishing options", quote.finishing],
  ["Deadline", quote.deadline],
  ["Pickup / delivery preference", quote.handover],
  ["Budget range", quote.budget],
  ["Message", quote.message],
];

const contactRows = (contact) => [
  ["Name", contact.fullName],
  ["Phone", contact.phone],
  ["Email", contact.email],
  ["Subject", contact.subject],
  ["Message", contact.message],
];

const makeTextEmail = (title, rows) => {
  const details = rows
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(", ") : value || "Not provided"}`)
    .join("\n");

  return `${title}\n\n${details}\n\n${config.businessName}\n${config.businessPhone}\n${config.businessAddress}`;
};

const getAttachment = (file) => {
  if (!file) {
    return [];
  }

  const safeFilename = path
    .basename(file.originalname || "artwork")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "-");

  return [
    {
      filename: safeFilename,
      content: file.buffer,
      contentType: file.mimetype,
    },
  ];
};

const sendOwnerEmail = async ({ subject, html, text, replyTo, attachments }) => {
  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to: config.businessEmail,
      replyTo: replyTo || undefined,
      subject,
      html,
      text,
      attachments,
    });
  } catch (error) {
    console.error("Owner email delivery failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    throw new AppError(EMAIL_SEND_MESSAGE, 502);
  }
};

const sendCustomerEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    return;
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error("Customer confirmation email delivery failed:", {
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });
    throw new AppError(EMAIL_SEND_MESSAGE, 502);
  }
};

const sendQuoteEmails = async (quote, file) => {
  const ownerRows = quoteRows(quote);
  const ownerSubject = `New quote request: ${quote.serviceNeeded}`;
  const replyTo = quote.email || undefined;

  await sendOwnerEmail({
    subject: ownerSubject,
    replyTo,
    attachments: getAttachment(file),
    html: baseEmailTemplate({
      title: "New Quote Request",
      intro: "A customer submitted a quote request through the website.",
      rows: ownerRows,
      footer: "Follow up with the customer by phone, WhatsApp, or email before production begins.",
    }),
    text: makeTextEmail("New Quote Request", ownerRows),
  });

  await sendCustomerEmail({
    to: quote.email,
    subject: `We received your quote request - ${config.businessName}`,
    html: baseEmailTemplate({
      title: "Quote Request Received",
      intro:
        "Thank you for contacting Mico Industrial Press. We have received your print request and will review the details before responding.",
      rows: [
        ["Service requested", quote.serviceNeeded],
        ["Quantity", quote.quantity],
        ["Phone", quote.phone],
        ["Message", quote.message],
      ],
      footer: `For urgent updates, call ${config.businessPhone} or use WhatsApp.`,
    }),
    text: makeTextEmail("Quote Request Received", [
      ["Service requested", quote.serviceNeeded],
      ["Quantity", quote.quantity],
      ["Phone", quote.phone],
      ["Message", quote.message],
    ]),
  });
};

const sendContactEmails = async (contact) => {
  const ownerRows = contactRows(contact);

  await sendOwnerEmail({
    subject: `New contact message: ${contact.subject}`,
    replyTo: contact.email || undefined,
    html: baseEmailTemplate({
      title: "New Contact Message",
      intro: "A customer sent a contact message through the website.",
      rows: ownerRows,
      footer: "Reply by phone, WhatsApp, or email depending on the contact details provided.",
    }),
    text: makeTextEmail("New Contact Message", ownerRows),
  });

  await sendCustomerEmail({
    to: contact.email,
    subject: `We received your message - ${config.businessName}`,
    html: baseEmailTemplate({
      title: "Message Received",
      intro:
        "Thank you for contacting Mico Industrial Press. We have received your message and will respond as soon as possible.",
      rows: [
        ["Subject", contact.subject],
        ["Phone", contact.phone],
        ["Message", contact.message],
      ],
      footer: `For urgent print jobs, call ${config.businessPhone} or use WhatsApp.`,
    }),
    text: makeTextEmail("Message Received", [
      ["Subject", contact.subject],
      ["Phone", contact.phone],
      ["Message", contact.message],
    ]),
  });
};

module.exports = {
  sendContactEmails,
  sendQuoteEmails,
};
