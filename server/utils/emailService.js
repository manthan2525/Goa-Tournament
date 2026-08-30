import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const isSmtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
);

let transporter = null;
if (isSmtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends a password reset email to the user
 */
export const sendPasswordResetEmail = async (email, resetToken, userName = 'User') => {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  const message = `
Hello ${userName},

You recently requested to reset your password for your Goa Tournament account.

Click the link below to set a new password:
${resetUrl}

This link is valid for 1 hour. If you did not make this request, you can safely ignore this email.

Best regards,
Goa Tournament Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #10b981; margin: 0;">GOA TOURNAMENT</h2>
        <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Multi-Sport Arena</p>
      </div>
      <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #334155;">
        <h3 style="margin-top: 0; color: #ffffff;">Password Reset Request</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">Hello <strong>${userName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          We received a request to reset your password for your Goa Tournament account. Click the button below to choose a new password:
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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"GoaSportX" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset your GoaSportX Password',
        text: message,
        html,
      });
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error('[SMTP Email Error]', err.message);
      return { success: true, method: 'dev_fallback', resetUrl };
    }
  } else {
    // Development mode fallback
    console.log('----------------------------------------------------');
    console.log(`[Password Reset Email Simulation for ${email}]`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('----------------------------------------------------');
    return { success: true, method: 'dev_fallback', resetUrl };
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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"GoaSportX Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${otpCode} is your GoaSportX Password Reset OTP Code`,
        text: message,
        html,
      });
      return { success: true, method: 'smtp' };
    } catch (err) {
      console.error('[SMTP OTP Email Error]', err.message);
      return { success: true, method: 'dev_fallback', otpCode };
    }
  } else {
    console.log('----------------------------------------------------');
    console.log(`[GoaSportX Password Reset OTP Code for ${email}]`);
    console.log(`OTP Code: ${otpCode}`);
    console.log('----------------------------------------------------');
    return { success: true, method: 'dev_fallback', otpCode };
  }
};
