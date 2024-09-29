const nodemailer = require('nodemailer');

const sendEmail = async (message, to, subject) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
