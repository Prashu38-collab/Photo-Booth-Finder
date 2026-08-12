import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });

    // Don't reveal whether the account exists.
    if (!user) {
      return NextResponse.json({ message: 'If an account exists for this email, a password reset link has been sent.' });
    }

    await db.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');

    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
      },
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, token);
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }

    return NextResponse.json({ message: 'If an account exists for this email, a password reset link has been sent.' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json({ error: 'Failed to request password reset.' }, { status: 500 });
  }
}
