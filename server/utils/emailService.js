import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const getTransporter = () => {
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').replace(/\s+/g, ''); // Strip spaces from App Password
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  if (!smtpUser || !smtpPass || smtpUser.includes('your_personal_email') || smtpPass.includes('your_16_character')) {
    return null;
  }

  // Use service: 'gmail' if host is smtp.gmail.com
  if (smtpHost.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 12000, // 12s connection timeout
      greetingTimeout: 8000,
      socketTimeout: 15000,
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 12000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
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
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    throw new Error('Email service is not configured. Please set SMTP_USER and SMTP_PASS in environment settings.');
  }

  try {
    await Promise.race([
      transporter.sendMail({
        from: smtpFrom ? (smtpFrom.includes('<') ? smtpFrom : `"GoaSportX" <${smtpFrom}>`) : `"GoaSportX" <noreply@goasportx.com>`,
        to: email,
        subject: 'Reset your GoaSportX Password',
        text: message,
        html,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP Connection Timed Out')), 12000)
      ),
    ]);
    return { success: true, method: 'smtp' };
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
  const smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    const errorMsg = 'Email service is not configured. Please set SMTP_USER (your Gmail address) and SMTP_PASS (your 16-character Gmail App Password) in your server .env file or Render Environment variables.';
    console.error('[SMTP Config Missing]', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    await Promise.race([
      transporter.sendMail({
        from: smtpFrom ? (smtpFrom.includes('<') ? smtpFrom : `"GoaSportX Security" <${smtpFrom}>`) : `"GoaSportX" <noreply@goasportx.com>`,
        to: email,
        subject: `${otpCode} is your GoaSportX Password Reset OTP Code`,
        text: message,
        html,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP Connection timed out after 12 seconds. Please verify your Gmail App Password and network settings.')), 12000)
      ),
    ]);
    console.log(`[REAL EMAIL SENT SUCCESS] OTP email delivered to ${email}`);
    return { success: true, method: 'smtp' };
  } catch (err) {
    console.error('[SMTP Email Delivery Error]', err.message);
    throw new Error(`Failed to deliver OTP email: ${err.message}`);
  }
};
