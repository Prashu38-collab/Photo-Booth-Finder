import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { ReportType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const { boothId, issueType, comment } = await req.json();

    if (!boothId || !issueType || !comment) {
      return NextResponse.json({ error: 'Booth ID, issue type, and comment are required.' }, { status: 400 });
    }

    const report = await db.report.create({
      data: {
        boothId,
        userId: user?.id || null,
        issueType: issueType as ReportType,
        comment,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ data: report }, { status: 201 });
  } catch (error) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
  }
}
