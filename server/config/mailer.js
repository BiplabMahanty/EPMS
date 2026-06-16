const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendMail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('your_email')) {
    console.log(`[mailer] Skipped (not configured): to=${to} subject=${subject}`);
    return;
  }
  return transporter.sendMail({ from: process.env.FROM_EMAIL, to, subject, html });
};

module.exports = { sendMail };
