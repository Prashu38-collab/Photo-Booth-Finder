import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'snapspot-nepal-super-secret-jwt-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest) {
  // Check Authorization header or cookie
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get('snapspot_token')?.value || null;
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
}

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;

export type RequireRoleResult =
  | { user: AuthUser; error?: never }
  | { user?: never; error: NextResponse };

/**
 * RBAC guard for API routes. Verifies the request is authenticated and that the
 * session user's role is included in `allowedRoles`. Returns the user on success,
 * or a 401/403 NextResponse that the route should return immediately.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: Role[]
): Promise<RequireRoleResult> {
  const user = await getAuthUser(req);

  if (!user) {
    return {
      error: NextResponse.json({ error: 'You must be logged in to perform this action.' }, { status: 401 }),
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 }),
    };
  }

  return { user };
}
