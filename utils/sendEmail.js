const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig.js");

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
