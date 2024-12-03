const sendEmail = require("./sendEmail");

/**
 * Sends a password reset email to a user
 * 
 * Generates and sends an email with a password reset link,
 * containing a unique token for secure password recovery.
 * 
 * @async
 * @function sendResetPasswordEmail
 * @param {Object} options - Email configuration options
 * @param {string} options.name - User's name
 * @param {string} options.email - User's email address
 * @param {string} options.token - Unique password reset token
 * @param {string} options.origin - Application origin/base URL
 * 
 * @returns {Promise<Object>} Result of the email sending operation
 * 
 * @throws {Error} If email sending fails
 * 
 * @example
 * await sendResetPasswordEmail({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   token: 'unique-reset-token',
 *   origin: 'https://myapp.com'
 * })
 */
const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  // This is the front-end url, where the user will updated their password
  // To test it in postman, first get the token, make a post request to {SERVER}/api/v1/auth/forgot-password
  // Then check your email, click the link, get the token from the url query parameters
  // Make a post request to {SERVER}/api/v1/auth/reset-password
  // request body: {
  //     "email": "example@mail",
  //     "password": "newPassword",
  //     "token": "token"
  // }
  const resetPasswordURL = `${origin}/user/reset-password?token=${token}&email=${email}`;
  // const resetPasswordURL = `${origin}/api/v1/auth/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset your password by clicking the following link: 
  <a href="${resetPasswordURL}">Reset Password</a> </p>`;

  const resetPasswordEmail = {
    to: email, // Change to your recipient
    subject: "Reset Password",
    html: `<h4>Hello, ${name}</h4>
    ${message}
    `,
  };

 return sendEmail(resetPasswordEmail);
  
};

module.exports = sendResetPasswordEmail;
