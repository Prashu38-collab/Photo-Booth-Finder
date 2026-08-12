import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to claim a business.' }, { status: 401 });
    }

    const { boothId, proofDetails } = await req.json();

    if (!boothId || !proofDetails) {
      return NextResponse.json({ error: 'Booth ID and verification proof details are required.' }, { status: 400 });
    }

    const claim = await db.businessClaim.create({
      data: {
        boothId,
        userId: user.id,
        proofDetails,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ data: claim }, { status: 201 });
  } catch (error) {
    console.error('Error claiming business:', error);
    return NextResponse.json({ error: 'Failed to submit business claim.' }, { status: 500 });
  }
}
