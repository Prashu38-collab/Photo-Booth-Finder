import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_PORT) === '465',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS || '',
      },
    });
  }

  return transporter;
}

interface SendResult {
  sent: boolean;
}

/**
 * Sends an email via SMTP. If SMTP isn't configured, falls back to logging
 * the message to the console so dev flows can still be tested.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const t = getTransporter();

  if (!t) {
    console.log(`[mail][smtp not configured] To: ${to} | Subject: ${subject}`);
    return { sent: false };
  }

  const from = process.env.SMTP_FROM || `SnapSpot Nepal <${process.env.SMTP_USER}>`;

  await t.sendMail({ from, to, subject, html });
  return { sent: true };
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<SendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const subject = 'Verify your SnapSpot Nepal email';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #e11d48;">SnapSpot Nepal</h2>
      <p>Hi ${name},</p>
      <p>Please confirm your email address to activate your account.</p>
      <p>
        <a href="${url}"
           style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold;">
          Verify Email
        </a>
      </p>
      <p style="color: #64748b; font-size: 12px;">
        Or copy this link: <a href="${url}">${url}</a><br/>
        This link expires in 24 hours.
      </p>
      <p style="color: #64748b; font-size: 12px;">If you didn't create this account, you can ignore this email.</p>
    </div>
  `;

  const result = await sendEmail(to, subject, html);
  if (!result.sent) {
    console.log(`[mail][smtp not configured] Verification link for ${to}: ${url}`);
  }
  return result;
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<SendResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${baseUrl}/reset-password?token=${token}`;

  const subject = 'Reset your SnapSpot Nepal password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #e11d48;">SnapSpot Nepal</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <p>
        <a href="${url}"
           style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 24px;
                  border-radius: 8px; text-decoration: none; font-weight: bold;">
          Reset Password
        </a>
      </p>
      <p style="color: #64748b; font-size: 12px;">
        Or copy this link: <a href="${url}">${url}</a><br/>
        This link expires in 1 hour. If you didn't request this, you can ignore this email.
      </p>
    </div>
  `;

  const result = await sendEmail(to, subject, html);
  if (!result.sent) {
    console.log(`[mail][smtp not configured] Password reset link for ${to}: ${url}`);
  }
  return result;
}
