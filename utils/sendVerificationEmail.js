const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async({ name, email, verificationToken, origin }) => {

  // Specific route in the front-end
  // const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  // Using verify-email route in the server + Modified the route's method to GET + Data gets extracted from req.query
  const verifyEmail = `${origin}/api/v1/auth/verify-email?verificationToken=${verificationToken}&email=${email}`;

  const message = `<p>Please confirm your email by clicking the following link: 
  <a href="${verifyEmail}">Verify Email</a> </p>`;

  const confirmationEmail = {
    to: email, // Change to your recipient
    from: `${process.env.SENDGRID_SENDER}`, // Change to your verified sender
    subject: "Email Confirmation.",
    html: `<h4>Hello, ${name}</h4>
    ${message}
    `,
  };

  sgMail
  .send(confirmationEmail)
  .catch((error) => {
    console.error(error);
  });

}

module.exports = sendVerificationEmail;
