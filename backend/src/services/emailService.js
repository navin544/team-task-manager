const nodemailer = require('nodemailer');

const env = require('../config/env');

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    console.info(`Email skipped. To: ${to}; Subject: ${subject}; Preview: ${text || html}`);
    return;
  }

  try {
    await activeTransporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
      text
    });
  } catch (error) {
    console.error('Email Sending Failed:', error);
    // In production we might not want to crash the whole request if email fails, 
    // but for debugging we need to know why it failed.
    throw error;
  }
}

module.exports = {
  sendEmail
};
