import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, [Role.ADMIN]);
    if (auth.error) return auth.error;

    const reports = await db.report.findMany({
      include: {
        booth: {
          select: { name: true, slug: true, area: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    return NextResponse.json({ error: 'Failed to retrieve reports.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, [Role.ADMIN]);
    if (auth.error) return auth.error;

    const { reportId, status } = await req.json();

    const updated = await db.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report.' }, { status: 500 });
  }
}
