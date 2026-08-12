import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const areasRaw = await db.photobooth.findMany({
      select: { area: true, district: true },
      distinct: ['area'],
    });

    const areas = areasRaw.map((a) => a.area).sort();

    return NextResponse.json({
      data: {
        areas,
        districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
      },
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    return NextResponse.json({ error: 'Failed to fetch area list.' }, { status: 500 });
  }
}
