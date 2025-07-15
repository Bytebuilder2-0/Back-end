

const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,       
      pass: process.env.EMAIL_APP_PASS,   
    },
  });

  const verificationUrl = `http://localhost:5173/verify-email?token=${token}`; // frontend URL

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    html: `
      <p>Click below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
