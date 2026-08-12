import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { Role } from '@prisma/client';
import { geocodeAddress } from '@/lib/geocode';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, [Role.BUSINESS_OWNER, Role.ADMIN]);
    if (auth.error) return auth.error;
    const user = auth.user;

    const { id } = await params;
    const body = await req.json();

    const booth = await db.photobooth.findUnique({ where: { id } });
    if (!booth) {
      return NextResponse.json({ error: 'Photo booth not found.' }, { status: 404 });
    }

    let address = body.address || booth.address;
    let latitude = booth.latitude;
    let longitude = booth.longitude;
    if (body.address && body.address.trim() !== booth.address) {
      const geo = await geocodeAddress(body.address);
      if (!geo) {
        return NextResponse.json(
          { error: "Couldn't locate that address. Please check the address and try again." },
          { status: 400 }
        );
      }
      latitude = geo.lat;
      longitude = geo.lng;
    }

    const updated = await db.photobooth.update({
      where: { id },
      data: {
        priceFrom: body.priceFrom !== undefined ? parseInt(body.priceFrom, 10) : booth.priceFrom,
        priceTo: body.priceTo !== undefined ? parseInt(body.priceTo, 10) : booth.priceTo,
        description: body.description || booth.description,
        phone: body.phone || booth.phone,
        instagram: body.instagram || booth.instagram,
        website: body.website || booth.website,
        address,
        latitude,
        longitude,
        verificationStatus: user.role === 'ADMIN' ? booth.verificationStatus : 'NEEDS_VERIFICATION',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Error updating business photobooth:', error);
    return NextResponse.json({ error: 'Failed to update photo booth details.' }, { status: 500 });
  }
}
