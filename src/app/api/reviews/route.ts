import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to submit a review.' }, { status: 401 });
    }

    const { boothId, rating, comment, photoUrl } = await req.json();

    if (!boothId || !rating || !comment) {
      return NextResponse.json({ error: 'Booth ID, star rating, and review text are required.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        boothId,
        userId: user.id,
        rating: parseInt(rating, 10),
        comment,
        photoUrl: photoUrl || null,
        status: 'APPROVED', // Default approved for MVP, admin can moderate
      },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
    });

    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
