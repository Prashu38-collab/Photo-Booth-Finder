import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scoreAndRankBooths, RecommendationPreferences } from '@/lib/recommendation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prefs: RecommendationPreferences = {
      userLocation: body.userLocation,
      targetArea: body.targetArea,
      budget: body.budget,
      boothTypeSlug: body.boothTypeSlug,
      groupSize: body.groupSize,
      requiredFeatureSlugs: body.requiredFeatureSlugs,
    };

    // Fetch active candidates
    const candidates = await db.photobooth.findMany({
      where: { status: 'ACTIVE' },
      include: {
        boothType: true,
        features: {
          include: {
            feature: true,
          },
        },
        photos: true,
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });

    const ranked = scoreAndRankBooths(candidates, prefs);

    // Return top matches (up to 5)
    return NextResponse.json({
      data: ranked.slice(0, 5),
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}
