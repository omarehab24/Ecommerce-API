const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetPasswordEmail = async ({
  name,
  email,
  token,
  origin,
}) => {
  const resetPasswordURL = `${origin}/user/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset your password by clicking the following link: 
  <a href="${resetPasswordURL}">Reset Password</a> </p>`;

  const resetPasswordEmail = {
    to: email, // Change to your recipient
    from: "omarehabm@gmail.com", // Change to your verified sender
    subject: "Reset Password",
    html: `<h4>Hello, ${name}</h4>
    ${message}
    `,
  };

  try {
    await sgMail.send(resetPasswordEmail)
  } catch (error) {
    console.log('Error sending email!');
  }
  
};

module.exports = sendResetPasswordEmail;
