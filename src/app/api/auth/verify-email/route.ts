import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

function resultPage(title: string, message: string, ok: boolean): Response {
  const color = ok ? '#262626' : '#7a3b3b';
  return new Response(
    `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${title} - SnapSpot Nepal</title>
      </head>
      <body style="margin:0;font-family:Arial,sans-serif;background:#f8f5f5;display:flex;align-items:center;justify-content:center;min-height:100vh;">
        <div style="background:#fff;padding:40px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.08);max-width:420px;text-align:center;margin:20px;">
          <div style="width:52px;height:52px;border-radius:50%;background:${color};color:#fff;font-size:28px;line-height:52px;margin:0 auto 16px;">${ok ? '✓' : '!'}</div>
          <h1 style="font-size:20px;color:#262626;margin:0 0 8px;">${title}</h1>
          <p style="font-size:14px;color:#575757;line-height:1.6;margin:0 0 24px;">${message}</p>
          <a href="/login" style="display:inline-block;background:#262626;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Go to Sign In</a>
        </div>
      </body>
    </html>`,
    { status: ok ? 200 : 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return resultPage('Invalid Link', 'The verification link is missing. Please try again.', false);
    }

    const record = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return resultPage(
        'Link Invalid or Expired',
        'This verification link is invalid or has expired. Try signing in to resend a new link.',
        false
      );
    }

    await db.$transaction([
      db.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    return resultPage(
      'Email Verified',
      'Your email address has been verified. You can now sign in to your account.',
      true
    );
  } catch (error) {
    console.error('Error verifying email:', error);
    return resultPage('Something Went Wrong', 'We could not verify your email right now. Please try again later.', false);
  }
}
