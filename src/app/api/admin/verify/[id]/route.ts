import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, [Role.ADMIN]);
    if (auth.error) return auth.error;
    const user = auth.user;

    const { id } = await params;
    const { status, notes } = await req.json();

    const updated = await db.photobooth.update({
      where: { id },
      data: {
        verificationStatus: status || 'VERIFIED',
        verifiedBySource: `Verified by Admin (${user.name})`,
        lastVerifiedAt: new Date(),
      },
    });

    await db.verificationRecord.create({
      data: {
        boothId: id,
        verifiedByUserId: user.id,
        notes: notes || 'Verified by admin',
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error verifying booth:', error);
    return NextResponse.json({ error: 'Failed to verify photo booth.' }, { status: 500 });
  }
}
