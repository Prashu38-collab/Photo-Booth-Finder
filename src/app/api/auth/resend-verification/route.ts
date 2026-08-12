import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Don't reveal whether the account exists.
    if (!user) {
      return NextResponse.json({ message: 'If this account exists, a verification email has been sent.' });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'This email address is already verified.' });
    }

    await db.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');

    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    await sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({ message: 'If this account exists, a verification email has been sent.' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json({ error: 'Failed to resend verification email.' }, { status: 500 });
  }
}
