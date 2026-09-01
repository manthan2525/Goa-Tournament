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

// Strict IPv4 DNS lookup callback to prevent ENETUNREACH IPv6 socket errors on Render/Linux
const ipv4Lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { family: 4, hints: 0 }, (err, address) => {
    if (err) return callback(err);
    callback(null, address, 4);
  });
};

// Resend HTTPS API delivery helper (Port 443 - 100% unblocked on Render and cloud hosts)
const sendViaResendApi = async (to, subject, html, text) => {
  const apiKey = (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const fromAddress = process.env.RESEND_FROM || 'GoaSportX Security <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[RESEND HTTPS API SUCCESS] Email delivered to ${to} (Message ID: ${data.id})`);
      return { success: true, messageId: data.id, method: 'resend_https_api' };
    }
    console.warn('[Resend HTTPS API Warning]', data.message || JSON.stringify(data));
    if (data.message && data.message.includes('only send testing emails')) {
      throw new Error(`Resend free test domain only permits emails to goasportx004@gmail.com. Please enter goasportx004@gmail.com or add a Brevo API Key (xkeysib-...) on Render.`);
    }
  } catch (err) {
    console.error('[Resend HTTPS API Error]', err.message);
    if (err.message && err.message.includes('Resend free test domain')) {
      throw err;
    }
  }
  return null;
};

// Brevo HTTPS API delivery helper (Port 443 - 300 free emails/day to any recipient)
const sendViaBrevoApi = async (to, subject, html, text) => {
  const apiKey = (process.env.BREVO_API_KEY || '').trim();
  if (!apiKey) return null;

  try {
    const senderEmail = (process.env.SMTP_USER || 'goasportx004@gmail.com').trim();
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'GoaSportX', email: senderEmail },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
        textContent: text,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[BREVO HTTPS API SUCCESS] Email delivered to ${to} (Message ID: ${data.messageId})`);
      return { success: true, messageId: data.messageId, method: 'brevo_https_api' };
    }
    console.warn('[Brevo HTTPS API Warning]', data.message || JSON.stringify(data));
  } catch (err) {
    console.error('[Brevo HTTPS API Error]', err.message);
  }
  return null;
};

// Resolve smtp.gmail.com to explicit IPv4 IP string address so Node.js net socket never attempts IPv6
const getGmailIpv4Host = async () => {
  try {
    const ips = await dns.promises.resolve4('smtp.gmail.com');
    if (ips && ips.length > 0) {
      return ips[0]; // e.g. '192.178.211.108'
    }
  } catch (e) {
    // fallback
  }
  return 'smtp.gmail.com';
};

const getTransporter = async () => {
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpPass = (process.env.SMTP_PASS || process.env.GMAIL_PASS || '').replace(/\s+/g, '');
  const smtpHost = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();

  if (!smtpUser || !smtpPass || smtpUser.includes('your_personal_email') || smtpPass.includes('your_16_character')) {
    return null;
  }

  // Use Port 587 STARTTLS for Gmail accounts (unblocked on Render and cloud hosts)
  if (smtpHost.includes('gmail') || smtpUser.endsWith('@gmail.com')) {
    const targetHost = await getGmailIpv4Host();
    return nodemailer.createTransport({
      host: targetHost,
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
      lookup: ipv4Lookup,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
      tls: {
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    family: 4,
    lookup: ipv4Lookup,
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

  const transporter = await getTransporter();
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    throw new Error('Email service is not configured. Please set SMTP_USER and SMTP_PASS in environment settings.');
  }

  const mailOptions = {
    from: smtpUser,
    to: email,
    subject: '[GoaSportX] Reset your Password',
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

  // Attempt 1: Brevo HTTPS API (Port 443 - 300 free emails/day to any recipient)
  if (process.env.BREVO_API_KEY) {
    const brevoResult = await sendViaBrevoApi(email, `[GoaSportX] ${otpCode} is your Password Reset OTP Code`, html, message);
    if (brevoResult) return brevoResult;
  }

  // Attempt 2: Resend HTTPS API (Port 443 - 100% unblocked on Render)
  if (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY) {
    const resendResult = await sendViaResendApi(email, `[GoaSportX] ${otpCode} is your Password Reset OTP Code`, html, message);
    if (resendResult) return resendResult;
  }

  const transporter = await getTransporter();
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  let smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!transporter) {
    throw new Error('Email service is not configured. Please set RESEND_API_KEY (or SMTP_USER and SMTP_PASS) in your environment settings.');
  }

  const mailOptions = {
    from: smtpUser, // Plain email address prevents Google from dropping emails due to display name spoofing
    to: email,
    subject: `[GoaSportX] ${otpCode} is your Password Reset OTP Code`,
    text: message,
    html,
  };

  try {
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email server connection timed out after 8 seconds.')), 8000)
      ),
    ]);
    console.log(`[REAL EMAIL SENT SUCCESS] OTP email delivered to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[SMTP Email Delivery Error]', err.message);
    const isBadCredentials = err.message?.includes('535') || err.message?.includes('Invalid login') || err.code === 'EAUTH';
    if (isBadCredentials) {
      throw new Error(`Gmail authentication failed (535 Bad Credentials). Please verify your 16-character App Password at myaccount.google.com/apppasswords.`);
    }

    const isTimeout = err.message?.includes('timed out') || err.message?.includes('ETIMEDOUT') || err.code === 'ETIMEDOUT';
    if (isTimeout) {
      throw new Error(`Email server connection timed out. On cloud hosts like Render, please add RESEND_API_KEY to your Render Environment settings for instant Port 443 email delivery.`);
    }

    throw new Error(`Failed to deliver OTP email to ${email}: ${err.message}`);
  }
};

/**
 * Sends a 6-digit Email Verification OTP code to new registered users
 */
export const sendVerificationOtpEmail = async (email, otpCode, userName = 'User') => {
  const message = `
Hello ${userName},

Welcome to GoaSportX! Your 6-digit account verification code is: ${otpCode}

This code is valid for 10 minutes. Please enter this code to activate your account.

Best regards,
GoaSportX Team
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background-color: #0f172a; color: #ffffff; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 24px;">Goa<span style="color: #f59e0b;">SportX</span></h2>
        <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">One Platform. Every Sport. Every Tournament.</p>
      </div>
      <div style="background-color: #1e293b; padding: 28px; border-radius: 12px; border: 1px solid #334155; text-align: center;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 18px;">Account Email Verification</h3>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
          Welcome <strong>${userName}</strong>!<br/>Enter the 6-digit OTP code below to verify your email and activate your account:
        </p>
        
        <div style="background-color: #0f172a; border: 2px dashed #10b981; border-radius: 12px; padding: 18px; margin: 24px 0; display: inline-block;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #10b981;">${otpCode}</span>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          This OTP code is valid for <strong>10 minutes</strong>.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 11px;">
        &copy; ${new Date().getFullYear()} GoaSportX. All rights reserved.
      </div>
    </div>
  `;

  // Attempt 1: Brevo HTTPS API
  if (process.env.BREVO_API_KEY) {
    const brevoResult = await sendViaBrevoApi(email, `[GoaSportX] ${otpCode} is your Email Verification Code`, html, message);
    if (brevoResult) return brevoResult;
  }

  // Attempt 2: Resend HTTPS API
  if (process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY) {
    const resendResult = await sendViaResendApi(email, `[GoaSportX] ${otpCode} is your Email Verification Code`, html, message);
    if (resendResult) return resendResult;
  }

  const transporter = await getTransporter();
  let smtpUser = (process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();

  if (!transporter) {
    throw new Error('Email service is not configured. Please set RESEND_API_KEY, BREVO_API_KEY, or SMTP_USER.');
  }

  const mailOptions = {
    from: smtpUser,
    to: email,
    subject: `[GoaSportX] ${otpCode} is your Email Verification Code`,
    text: message,
    html,
  };

  try {
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email server connection timed out after 8 seconds.')), 8000)
      ),
    ]);
    console.log(`[VERIFICATION EMAIL SENT SUCCESS] Verification code delivered to ${email} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Verification Email Delivery Error]', err.message);
    throw new Error(`Failed to deliver verification email to ${email}: ${err.message}`);
  }
};
