const config = require('./config')
const createTransporter = require('./nodemailerConfig')

/**
 * Sends an email using the configured Nodemailer transporter
 * 
 * A generic email sending utility that can be used for 
 * various email communication needs in the application.
 * 
 * @async
 * @function sendEmail
 * @param {Object} options - Email configuration options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML content of the email
 * 
 * @returns {Promise<Object>} Result of the email sending operation
 * 
 * @throws {Error} If email sending fails
 * 
 * @example
 * await sendEmail({
 *   to: 'user@example.com', 
 *   subject: 'Welcome!', 
 *   html: '<h1>Welcome to our service</h1>'
 * })
 */
const sendEmail = async ({ to, subject, html }) => {
  // Create a transporter
  const transporter = createTransporter()

  // Send email
  return await transporter.sendMail({
    from: config.GMAIL_EMAIL,
    to,
    subject,
    html
  })
}

module.exports = sendEmail
