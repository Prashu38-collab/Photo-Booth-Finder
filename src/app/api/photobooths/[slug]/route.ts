import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzeReviewAspects } from '@/lib/sentiment';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const booth = await db.photobooth.findUnique({
      where: { slug },
      include: {
        boothType: true,
        features: {
          include: {
            feature: true,
          },
        },
        photos: {
          orderBy: { isPrimary: 'desc' },
        },
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { name: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        claims: {
          where: { status: 'APPROVED' },
          select: { id: true, createdAt: true },
        },
      },
    });

    if (!booth) {
      return NextResponse.json({ error: 'Photo booth not found.' }, { status: 404 });
    }

    const avgRating =
      booth.reviews.length > 0
        ? Math.round(
            (booth.reviews.reduce((sum, r) => sum + r.rating, 0) / booth.reviews.length) * 10
          ) / 10
        : null;

    // Review Aspect Sentiment Analysis
    const aspectSentiments = analyzeReviewAspects(booth.reviews);

    return NextResponse.json({
      data: {
        ...booth,
        avgRating,
        reviewCount: booth.reviews.length,
        aspectSentiments,
        isClaimed: booth.claims.length > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching booth details:', error);
    return NextResponse.json({ error: 'Failed to retrieve photo booth details.' }, { status: 500 });
  }
}
