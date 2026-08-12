import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, [Role.ADMIN]);
    if (auth.error) return auth.error;

    const totalBooths = await db.photobooth.count();
    const verifiedBooths = await db.photobooth.count({ where: { verificationStatus: 'VERIFIED' } });
    const needsVerification = await db.photobooth.count({ where: { verificationStatus: 'NEEDS_VERIFICATION' } });
    const totalUsers = await db.user.count();
    const totalReviews = await db.review.count();
    const pendingReports = await db.report.count({ where: { status: 'PENDING' } });

    // Most searched queries
    const recentSearches = await db.searchEvent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { query: true, area: true, createdAt: true },
    });

    return NextResponse.json({
      data: {
        totalBooths,
        verifiedBooths,
        needsVerification,
        totalUsers,
        totalReviews,
        pendingReports,
        recentSearches,
      },
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve platform analytics.' }, { status: 500 });
  }
}
