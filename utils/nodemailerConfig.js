const config = require("./config");
const nodemailer = require("nodemailer");

/**
 * Configures Nodemailer transporter for sending emails
 * 
 * Creates a reusable email transport configuration 
 * using Gmail SMTP service with environment-specific settings.
 * 
 * @module nodemailerConfig
 * @requires nodemailer
 * 
 * @returns {Object} Nodemailer transporter for sending emails
 * 
 * @example
 * const transporter = createTransporter()
 * await transporter.sendMail({ ... })
 */
const createTransporter = () => {
  // Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    // logger: true,
    // debug: true,
    auth: {
      user: config.GMAIL_EMAIL,
      pass: config.GMAIL_PASS,
    },
  });

  return transporter
}

module.exports = createTransporter;
