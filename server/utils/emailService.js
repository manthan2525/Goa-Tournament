import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Force Node.js to prefer IPv4 over IPv6 to fix ENETUNREACH errors on smtp.gmail.com
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (e) {
  // ignore
}

const getTransporter = () => {
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').replace(/\s+/g, '');
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();

  if (!smtpUser || !smtpPass || smtpUser.includes('your_personal_email') || smtpPass.includes('your_16_character')) {
    return null;
  }

  // Use Nodemailer service: 'gmail' for Gmail accounts
  if (smtpHost.includes('gmail') || smtpUser.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      family: 4,
      lookup: (h, o, cb) => dns.lookup(h, { family: 4 }, cb),
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    family: 4,
    lookup: (h, o, cb) => dns.lookup(h, { family: 4 }, cb),
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

/**
 * Sends a password reset email to the user
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `
Hello ${userName},

You recently requested to reset your password for your GoaSportX account.

Click the link below to set a new password:
${resetUrl}

This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.

Best regards,
GoaSportX Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin: 0;">GOASPORTX</h2>
        <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">One Platform. Every Sport. Every Tournament.</p>
      </div>
      <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #334155;">
        <h3 style="margin-top: 0; color: #ffffff;">Password Reset Request</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          We received a request to reset your password for your GoaSportX account. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: #022c22; font-weight: bold; padding: 12px 28px; border-radius: 8px; text-decoration: none; display: inline-block; font-size: 14px;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Or copy and paste this link into your browser:</p>
        <p style="color: #38bdf8; font-size: 12px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #64748b; font-size: 12px; margin-top: 20px; border-top: 1px solid #334155; pt: 15px;">
          This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  `;

  const transporter = getTransporter();
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    throw new Error('Email service is not configured. Please set SMTP_USER and SMTP_PASS in environment settings.');
  }

  const mailOptions = {
    from: smtpFrom ? (smtpFrom.includes('<') ? smtpFrom : `"GoaSportX" <${smtpFrom}>`) : `"GoaSportX" <noreply@goasportx.com>`,
    to: email,
    subject: 'Reset your GoaSportX Password',
    text: message,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[SMTP Reset Link Email Error]', err.message);
    throw new Error(`Email delivery failed: ${err.message}`);
  }
};

/**
 * Sends a 6-digit OTP verification code to the user's email
 */
export const sendOtpEmail = async (email, otpCode, userName = 'User') => {
  const message = `
Hello ${userName},

Your 6-digit OTP verification code to reset your GoaSportX password is: ${otpCode}

This code is valid for 10 minutes. Do not share this OTP code with anyone.

Best regards,
GoaSportX Security Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Goa<span style="color: #f59e0b;">SportX</span></h2>
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">One Platform. Every Sport. Every Tournament.</p>
      </div>
      <div style="background-color: #1e293b; padding: 28px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 18px;">Password Reset Verification OTP</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Hello <strong>${userName}</strong>,<br/>Use the 6-digit OTP code below to reset your password:
        </p>
        
        <div style="background-color: #0f172a; border: 2px dashed #10b981; border-radius: 12px; padding: 18px; margin: 24px 0; display: inline-block;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #10b981;">${otpCode}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          This OTP code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
        &copy; ${new Date().getFullYear()} GoaSportX. All rights reserved.
      </div>
    </div>
  `;

  const transporter = getTransporter();
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    throw new Error('Email service is not configured. Please set SMTP_USER (your Gmail) and SMTP_PASS (your 16-character Gmail App Password) in your server .env file or Render environment settings.');
  }

  const mailOptions = {
    from: smtpFrom ? (smtpFrom.includes('<') ? smtpFrom : `"GoaSportX Security" <${smtpFrom}>`) : `"GoaSportX" <noreply@goasportx.com>`,
    to: email,
    subject: `${otpCode} is your GoaSportX Password Reset OTP Code`,
    text: message,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[REAL EMAIL SENT SUCCESS] OTP email delivered to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[SMTP Email Delivery Error]', err.message);
    const isBadCredentials = err.message?.includes('535') || err.message?.includes('Invalid login') || err.code === 'EAUTH';
    if (isBadCredentials) {
      throw new Error(`Gmail authentication failed (535 Bad Credentials). Please verify your 16-character App Password at myaccount.google.com/apppasswords.`);
    }
    throw new Error(`Failed to deliver OTP email to ${email}: ${err.message}`);
  }
};
