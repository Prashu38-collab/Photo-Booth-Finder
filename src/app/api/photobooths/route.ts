import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateHaversineDistance } from '@/lib/geo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || searchParams.get('search') || '';
    const area = searchParams.get('area');
    const district = searchParams.get('district');
    const boothType = searchParams.get('boothType');
    const featuresParam = searchParams.get('features'); // comma-separated
    const budget = searchParams.get('budget');
    const groupSize = searchParams.get('groupSize');
    const verificationStatus = searchParams.get('verificationStatus');
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const radiusParam = searchParams.get('radius'); // in km
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const userLat = latParam ? parseFloat(latParam) : null;
    const userLng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : null;

    // Build Prisma query condition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      status: 'ACTIVE',
    };

    // 1. Partial Text Matching (name, area, district, address, description)
    if (query.trim().length > 0) {
      const qLower = query.trim().toLowerCase();
      where.OR = [
        { name: { contains: qLower, mode: 'insensitive' } },
        { area: { contains: qLower, mode: 'insensitive' } },
        { district: { contains: qLower, mode: 'insensitive' } },
        { address: { contains: qLower, mode: 'insensitive' } },
        { description: { contains: qLower, mode: 'insensitive' } },
      ];
    }

    // 2. Area & District Filter
    if (area && area !== 'all') {
      where.area = { contains: area, mode: 'insensitive' };
    }
    if (district && district !== 'all') {
      where.district = { equals: district, mode: 'insensitive' };
    }

    // 3. Booth Type Filter
    if (boothType && boothType !== 'all') {
      where.boothType = { slug: boothType };
    }

    // 4. Verification Status
    if (verificationStatus && verificationStatus !== 'all') {
      where.verificationStatus = verificationStatus;
    }

    // 5. Budget Range Filter
    if (budget && budget !== 'any') {
      if (budget === 'under-300') {
        where.priceFrom = { lte: 300 };
      } else if (budget === '300-500') {
        where.AND = [
          ...(where.AND || []),
          { priceFrom: { lte: 500 } },
          { priceTo: { gte: 300 } },
        ];
      } else if (budget === '500-1000') {
        where.AND = [
          ...(where.AND || []),
          { priceFrom: { lte: 1000 } },
          { priceTo: { gte: 500 } },
        ];
      } else if (budget === 'above-1000') {
        where.priceTo = { gte: 1000 };
      }
    }

    // Fetch matching booths from DB
    const rawBooths = await db.photobooth.findMany({
      where,
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
        openingHours: true,
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });

    // 6. Post-filter for Features & Group Size suitability
    let filteredBooths = rawBooths;

    if (featuresParam) {
      const requiredFeatures = featuresParam.split(',').map((f) => f.trim()).filter(Boolean);
      if (requiredFeatures.length > 0) {
        filteredBooths = filteredBooths.filter((booth) => {
          const boothFeatureSlugs = booth.features.map((f) => f.feature.slug);
          return requiredFeatures.every((req) => boothFeatureSlugs.includes(req));
        });
      }
    }

    if (groupSize && groupSize !== 'any') {
      const requiredSuitability = `${groupSize}-friendly`;
      filteredBooths = filteredBooths.filter((booth) => {
        const boothFeatureSlugs = booth.features.map((f) => f.feature.slug);
        return boothFeatureSlugs.includes(requiredSuitability) || boothFeatureSlugs.includes('group-friendly');
      });
    }

    // 7. Calculate Distance & Filter by Radius
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted = filteredBooths.map((booth: any) => {
      let distanceKm: number | null = null;
      if (userLat !== null && userLng !== null) {
        distanceKm = calculateHaversineDistance(userLat, userLng, booth.latitude, booth.longitude);
      }

      const avgRating =
        booth.reviews.length > 0
          ? Math.round((booth.reviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) / booth.reviews.length) * 10) / 10
          : null;

      return {
        ...booth,
        distanceKm,
        avgRating,
        reviewCount: booth.reviews.length,
      };
    });

    let results = formatted;

    if (userLat !== null && userLng !== null && radiusKm !== null) {
      results = results.filter((b: { distanceKm: number | null }) => b.distanceKm !== null && b.distanceKm <= radiusKm);
    }

    // 8. Sorting
    if (sortBy === 'distance' && userLat !== null) {
      results.sort((a: { distanceKm: number | null }, b: { distanceKm: number | null }) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sortBy === 'price_asc') {
      results.sort((a: { priceFrom: number | null }, b: { priceFrom: number | null }) => (a.priceFrom ?? 9999) - (b.priceFrom ?? 9999));
    } else if (sortBy === 'price_desc') {
      results.sort((a: { priceFrom: number | null }, b: { priceFrom: number | null }) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
    } else if (sortBy === 'rating') {
      results.sort((a: { avgRating: number | null }, b: { avgRating: number | null }) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    } else if (sortBy === 'freshness') {
      results.sort((a: { lastVerifiedAt: Date | null }, b: { lastVerifiedAt: Date | null }) => {
        const timeA = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
        const timeB = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    // Log analytics event asynchronously if search query provided
    if (query.trim().length > 0) {
      db.searchEvent.create({
        data: {
          query,
          area: area || null,
          filters: JSON.stringify({ boothType, budget, featuresParam }),
        },
      }).catch(() => {});
    }

    // Pagination
    const totalCount = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedResults,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching photobooths:', error);
    return NextResponse.json({ error: 'Unable to load photo booths. Please try again.' }, { status: 500 });
  }
}
