import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // RBAC: only allow self-registration as USER or BUSINESS_OWNER.
    // ADMIN can never be assigned through the public register endpoint.
    const allowedRoles = new Set<string>(['USER', 'BUSINESS_OWNER']);
    if (role && !allowedRoles.has(role)) {
      return NextResponse.json({ error: 'Invalid account role.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'BUSINESS_OWNER' ? Role.BUSINESS_OWNER : Role.USER;

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: assignedRole,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        token,
      },
    });

    res.cookies.set('snapspot_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Failed to register account.' }, { status: 500 });
  }
}
