import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const boothTypes = await db.boothType.findMany({
      orderBy: { name: 'asc' },
    });

    const features = await db.feature.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      data: {
        boothTypes,
        features,
      },
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json({ error: 'Failed to fetch features list.' }, { status: 500 });
  }
}
