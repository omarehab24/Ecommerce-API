const sendEmail = require("./sendEmail");

/**
 * Sends an email verification link to a user
 * 
 * Generates and sends an email with a unique verification token,
 * allowing users to confirm their email address.
 * 
 * @async
 * @function sendVerificationEmail
 * @param {Object} options - Email configuration options
 * @param {string} options.name - User's name
 * @param {string} options.email - User's email address
 * @param {string} options.verificationToken - Unique email verification token
 * @param {string} options.origin - Application origin/base URL
 * 
 * @returns {Promise<Object>} Result of the email sending operation
 * 
 * @throws {Error} If email sending fails
 * 
 * @example
 * await sendVerificationEmail({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   verificationToken: 'unique-verification-token',
 *   origin: 'https://myapp.com'
 * })
 */
const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  // Front-end
  // const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const verifyEmail = `${origin}/api/v1/auth/verify-email?verificationToken=${verificationToken}&email=${email}`;

  const message = `<div style="border: 1px solid #ddd; padding: 15px; margin: 15px;">
    <h4>Hello, ${name}</h4>
    <p>Please confirm your email by clicking the following link: 
    <a href="${verifyEmail}">Verify Email</a></p>
  </div>`;

  return sendEmail({
    to: email,
    subject: "Email Confirmation",
    html: message
  });
};

module.exports = sendVerificationEmail;
