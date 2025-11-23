const nodemailer = require('nodemailer');
const twilio = require('twilio');
const config = require('../config');

const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'DilaAds Support';

let mailTransporter = null;
let smsClient = null;

const isEmailConfigured = Boolean(
  config.EMAIL_HOST &&
  config.EMAIL_USER &&
  config.EMAIL_PASS
);

if (isEmailConfigured) {
  mailTransporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });
}

// Helper function to safely get string values
const getStringOrEmpty = (value) =>
  typeof value === 'string' ? value.trim() : '';

const twilioAccountSid = getStringOrEmpty(config.TWILIO_ACCOUNT_SID);
const twilioAuthToken = getStringOrEmpty(config.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = getStringOrEmpty(config.TWILIO_PHONE_NUMBER);

// Check if values look like placeholders
const looksLikePlaceholder = (value) => value.toLowerCase().includes('your-');

// Validate Twilio credentials before initializing
let isSmsConfigured =
  Boolean(twilioAccountSid && twilioAuthToken && twilioPhoneNumber) &&
  !looksLikePlaceholder(twilioAccountSid) &&
  !looksLikePlaceholder(twilioAuthToken) &&
  !looksLikePlaceholder(twilioPhoneNumber) &&
  twilioAccountSid.startsWith('AC');

if (isSmsConfigured) {
  try {
    smsClient = twilio(twilioAccountSid, twilioAuthToken);
  } catch (error) {
    console.warn(
      'Failed to initialize Twilio client. SMS notifications will be disabled.',
      error.message
    );
    smsClient = null;
    isSmsConfigured = false;
  }
} else if (twilioAccountSid || twilioAuthToken || twilioPhoneNumber) {
  console.warn(
    'Twilio credentials are missing or invalid. SMS notifications will be disabled.'
  );
}

const sendPasswordResetEmail = async ({ to, code, expiresInMinutes = 15 }) => {
  if (!mailTransporter) {
    console.warn('Email credentials are not configured. Unable to send password reset email.');
    return false;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #111827;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password on DilaAds. Use the verification code below:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563EB; margin: 24px 0;">${code}</div>
      <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="margin-top: 32px;">Best regards,<br />${EMAIL_FROM_NAME}</p>
    </div>
  `;

  try {
    await mailTransporter.sendMail({
      from: `${EMAIL_FROM_NAME} <${config.EMAIL_USER}>`,
      to,
      subject: 'Your DilaAds Password Reset Code',
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
};

const sendPasswordResetSMS = async ({ to, code, expiresInMinutes = 15 }) => {
  if (!smsClient) {
    console.warn('Twilio credentials are not configured. Unable to send password reset SMS.');
    return false;
  }

  const normalizedNumber = to.startsWith('+') ? to : `+${to}`;
  const message = `Your DilaAds reset code is ${code}. It expires in ${expiresInMinutes} minutes.`;

  try {
    await smsClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: normalizedNumber,
    });
    return true;
  } catch (error) {
    console.error('Failed to send password reset SMS:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetSMS,
  isEmailConfigured,
  isSmsConfigured,
};
