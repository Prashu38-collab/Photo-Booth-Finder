import { PrismaClient, Role, BoothStatus, VerificationStatus, ReportType, ReportStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { geocodeAddress } from '../src/lib/geocode';

const prisma = new PrismaClient();

type SeedReview = {
  userId: string;
  rating: number;
  comment: string;
};

type SeedBooth = {
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  district: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  instagram?: string | null;
  website?: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  boothTypeSlug: string;
  verificationStatus: VerificationStatus;
  isDemoData: boolean;
  verifiedBySource: string;
  lastVerifiedAt: Date | null;
  features: string[];
  photos: string[];
  reviews: SeedReview[];
  openingHours?: { open: string; close: string };
};

async function main() {
  console.log('🌱 Starting SnapSpot Nepal Database Seeding...');

  // 1. Clean existing data
  await prisma.searchEvent.deleteMany();
  await prisma.verificationRecord.deleteMany();
  await prisma.businessClaim.deleteMany();
  await prisma.report.deleteMany();
  await prisma.review.deleteMany();
  await prisma.openingHours.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.photoboothFeature.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.photobooth.deleteMany();
  await prisma.boothType.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users (Admin, Business Owner, Normal User)
  const passwordHash = await bcrypt.hash('password123', 10);
  const emailVerifiedAt = new Date();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@snapspot.np',
      name: 'Admin SnapSpot',
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt,
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@banhanstudio.np',
      name: 'Banhan Studio Owner',
      passwordHash,
      role: Role.BUSINESS_OWNER,
      emailVerifiedAt,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      name: 'Aarav Sharma',
      passwordHash,
      role: Role.USER,
      emailVerifiedAt,
    },
  });

  console.log(' Created core users');

  // 3. Create Booth Types
  const boothTypesData = [
    { name: 'Korean 4-cut', slug: 'korean-4-cut', description: 'Classic Korean style 4-strip photo booths with cute frames and props' },
    { name: 'Selfie Booth', slug: 'selfie-booth', description: 'Self-service photo booths with remote triggers and instant prints' },
    { name: '360° Booth', slug: '360-booth', description: 'Rotating slow-motion video platform capturing 360-degree videos' },
    { name: 'Mirror Booth', slug: 'mirror-booth', description: 'Full-length interactive touch screen glass mirror photo booth' },
    { name: 'Event Booth', slug: 'event-booth', description: 'Portable booth setup for popups, weddings, and special events' },
    { name: 'Studio', slug: 'studio', description: 'Professional self-photo studio with studio lighting setups' },
  ];

  const boothTypeMap: Record<string, string> = {};
  for (const bt of boothTypesData) {
    const created = await prisma.boothType.create({ data: bt });
    boothTypeMap[bt.slug] = created.id;
  }
  console.log('Created booth types');

  // 4. Create Features
  const featuresData = [
    { name: 'Physical Prints', slug: 'physical-prints', category: 'Outputs' },
    { name: 'Digital Copies', slug: 'digital-copies', category: 'Outputs' },
    { name: 'Multiple Photo Layouts', slug: 'multiple-layouts', category: 'Options' },
    { name: 'Props', slug: 'props', category: 'Amenities' },
    { name: 'Custom Frames', slug: 'custom-frames', category: 'Options' },
    { name: 'Video/GIF', slug: 'video-gif', category: 'Outputs' },
    { name: '360° Video', slug: '360-video', category: 'Outputs' },
    { name: 'Private Booth', slug: 'private-booth', category: 'Amenities' },
    { name: 'Group Friendly', slug: 'group-friendly', category: 'Suitability' },
    { name: 'Couple Friendly', slug: 'couple-friendly', category: 'Suitability' },
    { name: 'Solo Friendly', slug: 'solo-friendly', category: 'Suitability' },
    { name: 'Wheelchair Accessible', slug: 'wheelchair-accessible', category: 'Amenities' },
    { name: 'Cash Payment', slug: 'cash-payment', category: 'Payment' },
    { name: 'Digital Payment', slug: 'digital-payment', category: 'Payment' },
    { name: 'Filters', slug: 'filters', category: 'Options' },
  ];

  const featureMap: Record<string, string> = {};
  for (const f of featuresData) {
    const created = await prisma.feature.create({ data: f });
    featureMap[f.slug] = created.id;
  }
  console.log('Created features');

  // 5. Seed Real Verified Photobooths in Kathmandu District
  // All listings below were researched against public sources:
  //   - Banhan Studio / KOJA Photobooth: official Instagram & mall directories
  //   - House of Selfies: Kathmandu Post feature (23 themed booths)
  //   - memo4Frame: official City Centre Mall listing (pending field audit)
  //   - Photo Booth Nepal (Fun Photo Stations): registered company profile
  //   - KOJA at Chhaya Center: official Chhaya Center Facebook post (Aug 2025)
  //   - RENTABOOTH: TheNimto vendor listing (Kathmandu event photo booth)
  //   - Garima Florist & Events: official website (photo booth event service)
  //   - Selfie Mirror Photobooth Nepal: Instagram @selfiephotoboothnepal
  const booths: SeedBooth[] = [
    {
      name: 'Banhan Studio – Korean Photobooth (Civil Mall)',
      slug: 'banhan-studio-civil-mall',
      description: 'Korean-style 4-cut photobooth studio in Room 415 on the 4th floor of Civil Mall. Self-service booths with studio lighting, cute props, custom frames, instant physical prints and QR digital downloads. Confirmed operating via the official @thebanhanstudio Instagram page.',
      address: 'Room 415, 4th Floor, Civil Mall, Sundhara',
      area: 'Civil Mall',
      district: 'Kathmandu',
      latitude: 27.7006,
      longitude: 85.3134,
      instagram: '@thebanhanstudio',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'korean-4-cut',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Official Instagram @thebanhanstudio',
      lastVerifiedAt: new Date('2026-06-07'),
      features: ['physical-prints', 'digital-copies', 'multiple-layouts', 'props', 'custom-frames', 'video-gif', 'couple-friendly', 'group-friendly', 'digital-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '08:30 PM' },
    },
    {
      name: 'House of Selfies – Civil Mall',
      slug: 'house-of-selfies-civil-mall',
      description: '23 themed selfie photo booths on the 3rd floor of Civil Mall — pool party, Vogue cover, airline business-class and more, each with its own ring light. Wi-fi and changing rooms available. Rs 499/hour Mon–Thu, Rs 699/hour Fri–Sun & public holidays. Open 10am–7pm.',
      address: '3rd Floor, Civil Mall, Sundhara',
      area: 'Civil Mall',
      district: 'Kathmandu',
      latitude: 27.7006,
      longitude: 85.3134,
      priceFrom: 499,
      priceTo: 699,
      boothTypeSlug: 'selfie-booth',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Kathmandu Post feature article (Sept 2022)',
      lastVerifiedAt: new Date('2026-08-05'),
      features: ['private-booth', 'props', 'filters', 'video-gif', 'digital-copies', 'group-friendly', 'couple-friendly', 'solo-friendly', 'digital-payment'],
      photos: [
        'https://assets-cdn.kathmandupost.com/uploads/source/news/2022/lifestyle/HOUSEOFSELFIESTORY202209223956-1664333469.jpg'
      ],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '07:00 PM' },
    },
    {
      name: 'KOJA Photobooth – City Centre Mall',
      slug: 'koja-photobooth-city-centre',
      description: 'Korean-inspired photobooth kiosk on the 2nd floor of City Centre Mall, Kamalpokhari. Stylish backgrounds, cute props and instant photo strips for friends, couples and families. Listed in the official City Centre mall directory.',
      address: '2nd Floor, City Centre Mall, Kamalpokhari',
      area: 'Kamalpokhari',
      district: 'Kathmandu',
      latitude: 27.7128,
      longitude: 85.3212,
      phone: '+977 9818914600',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'korean-4-cut',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Official City Centre Mall store directory (2026)',
      lastVerifiedAt: new Date('2026-03-13'),
      features: ['physical-prints', 'digital-copies', 'props', 'couple-friendly', 'group-friendly', 'digital-payment'],
      photos: [
        'https://citycentrenepal.com/wp-content/uploads/2026/03/koja.webp'
      ],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '08:30 PM' },
    },
    {
      name: 'memo4Frame – City Centre Mall',
      slug: 'memo4frame-city-centre',
      description: 'New Korean 4-cut photo booth at City Centre Mall, Kamalpokhari — featured on the official City Centre page. Korean-style photo strips with aesthetic setups and instant prints. Brand origin is India; the Kathmandu kiosk is pending a field audit.',
      address: 'City Centre Mall, Kamalpokhari',
      area: 'Kamalpokhari',
      district: 'Kathmandu',
      latitude: 27.7128,
      longitude: 85.3212,
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'korean-4-cut',
      verificationStatus: VerificationStatus.NEEDS_VERIFICATION,
      isDemoData: false,
      verifiedBySource: 'Official City Centre Mall listing – pending field audit',
      lastVerifiedAt: null,
      features: ['physical-prints', 'digital-copies', 'props', 'custom-frames'],
      photos: [],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '08:30 PM' },
    },
    {
      name: 'Photo Booth Nepal (Fun Photo Stations)',
      slug: 'photo-booth-nepal-fun-photo-stations',
      description: 'Kathmandu-based portable photo booth service by Fun Photo Stations Pvt. Ltd. 32-inch interactive touchscreen booths with built-in HD camera, set up for weddings, parties, corporate and charity events anywhere in Kathmandu district. Instant prints and social sharing included.',
      address: 'On-site event service across Kathmandu district',
      area: 'Kathmandu',
      district: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      instagram: '@funphotostations',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'event-booth',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Company profile (Fun Photo Stations Pvt. Ltd.)',
      lastVerifiedAt: new Date('2026-06-22'),
      features: ['digital-copies', 'video-gif', 'props', 'group-friendly', 'digital-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '09:00 AM', close: '07:00 PM' },
    },
    {
      name: 'KOJA Photobooth – Chhaya Center',
      slug: 'koja-photobooth-chhaya-center',
      description: 'Second Kathmandu location of the KOJA Korean photobooth brand, opened at Chhaya Center, Thamel. Korean-style photo strips with stylish backgrounds, cute props and instant prints for friends, couples and families.',
      address: 'Chhaya Center, Sanchayakosh Chowk, Thamel',
      area: 'Thamel',
      district: 'Kathmandu',
      latitude: 27.7168,
      longitude: 85.3120,
      instagram: '@kojanepal',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'korean-4-cut',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Official Chhaya Center Facebook post (Aug 2025)',
      lastVerifiedAt: new Date('2025-08-11'),
      features: ['physical-prints', 'digital-copies', 'props', 'couple-friendly', 'group-friendly', 'digital-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '09:00 PM' },
    },
    {
      name: 'RENTABOOTH – Photo Booth Rental',
      slug: 'rentabooth-photo-booth-rental',
      description: 'Kathmandu-based photo booth rental service for weddings, receptions, birthdays, corporate events, brand activations, bratabandha and gufa ceremonies. Modern booth setups with creative backdrops, professional lighting, custom event branding, instant prints and digital copies. Bookable on TheNimto.',
      address: 'On-site event service across Kathmandu district',
      area: 'Kathmandu',
      district: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      phone: '+977 9802364691',
      priceFrom: 15999,
      priceTo: 25999,
      boothTypeSlug: 'event-booth',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'TheNimto vendor listing (official booking page)',
      lastVerifiedAt: new Date('2026-08-11'),
      features: ['physical-prints', 'digital-copies', 'video-gif', 'props', 'group-friendly', 'digital-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '09:00 AM', close: '09:00 PM' },
    },
    {
      name: 'Garima Florist & Events – Photo Booth',
      slug: 'garima-florist-events-photo-booth',
      description: 'Event planning company in Lazimpat with 15 years of experience, offering photo booth setups as part of weddings, receptions and parties. Complete event styling from décor to photography and photo booth.',
      address: 'Lazimpat, Kathmandu',
      area: 'Lazimpat',
      district: 'Kathmandu',
      latitude: 27.7144,
      longitude: 85.3106,
      phone: '+977 9851160562',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'event-booth',
      verificationStatus: VerificationStatus.VERIFIED,
      isDemoData: false,
      verifiedBySource: 'Official website garimaflorist.com',
      lastVerifiedAt: new Date('2026-08-11'),
      features: ['physical-prints', 'digital-copies', 'props', 'group-friendly', 'cash-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '09:00 AM', close: '06:00 PM' },
    },
    {
      name: 'Selfie Mirror Photobooth & 360 Videobooth Nepal',
      slug: 'selfie-mirror-photobooth-nepal',
      description: 'Kathmandu-based photo booth service offering full-length selfie mirror booths and 360-degree videobooth rentals for events and celebrations. Details pending on-site confirmation via the Instagram page.',
      address: 'On-site event service across Kathmandu district',
      area: 'Kathmandu',
      district: 'Kathmandu',
      latitude: 27.7172,
      longitude: 85.3240,
      instagram: '@selfiephotoboothnepal',
      priceFrom: null,
      priceTo: null,
      boothTypeSlug: 'mirror-booth',
      verificationStatus: VerificationStatus.NEEDS_VERIFICATION,
      isDemoData: false,
      verifiedBySource: 'Instagram @selfiephotoboothnepal – pending field audit',
      lastVerifiedAt: null,
      features: ['physical-prints', 'video-gif', '360-video', 'filters', 'private-booth', 'solo-friendly', 'couple-friendly', 'group-friendly', 'digital-payment'],
      photos: [],
      reviews: [],
      openingHours: { open: '10:00 AM', close: '08:00 PM' },
    },
  ];

  for (const b of booths) {
    const boothTypeId = boothTypeMap[b.boothTypeSlug];

    // Auto-geocode the address; fall back to the researched seed coordinates
    // when the lookup fails or the address is too vague.
    let latitude = b.latitude;
    let longitude = b.longitude;
    const geo = await geocodeAddress(b.address);
    if (geo) {
      latitude = geo.lat;
      longitude = geo.lng;
      console.log(`Geocoded "${b.name}" -> ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } else {
      console.warn(`Could not geocode "${b.name}", keeping seed coordinates.`);
    }

    const createdBooth = await prisma.photobooth.create({
      data: {
        name: b.name,
        slug: b.slug,
        description: b.description,
        address: b.address,
        area: b.area,
        district: b.district,
        latitude,
        longitude,
        phone: b.phone,
        instagram: b.instagram,
        website: b.website,
        priceFrom: b.priceFrom,
        priceTo: b.priceTo,
        boothTypeId,
        verificationStatus: b.verificationStatus,
        isDemoData: b.isDemoData,
        verifiedBySource: b.verifiedBySource,
        lastVerifiedAt: b.lastVerifiedAt,
      },
    });

    // Link features
    for (const fSlug of b.features) {
      const featureId = featureMap[fSlug];
      if (featureId) {
        await prisma.photoboothFeature.create({
          data: {
            boothId: createdBooth.id,
            featureId,
          },
        });
      }
    }

    // Add Photos
    for (let i = 0; i < b.photos.length; i++) {
      await prisma.photo.create({
        data: {
          boothId: createdBooth.id,
          url: b.photos[i],
          isPrimary: i === 0,
        },
      });
    }

    // Add Opening Hours (Mon-Sun) — customized per listing
    const hours = b.openingHours || { open: '10:00 AM', close: '08:30 PM' };
    for (let day = 0; day < 7; day++) {
      await prisma.openingHours.create({
        data: {
          boothId: createdBooth.id,
          dayOfWeek: day,
          openTime: hours.open,
          closeTime: hours.close,
          isClosed: false,
        },
      });
    }

    // Add Reviews if any
    if (b.reviews && b.reviews.length > 0) {
      for (const rev of b.reviews) {
        await prisma.review.create({
          data: {
            boothId: createdBooth.id,
            userId: rev.userId,
            rating: rev.rating,
            comment: rev.comment,
          },
        });
      }
    }
  }

  console.log(` Seeded ${booths.length} verified photobooths in Kathmandu District`);

  // Add 1 sample user report for testing Admin Queue
  const sampleBooth = await prisma.photobooth.findFirst({ where: { slug: 'memo4frame-city-centre' } });
  if (sampleBooth) {
    await prisma.report.create({
      data: {
        boothId: sampleBooth.id,
        userId: user.id,
        issueType: ReportType.OTHER,
        comment: 'Please verify this kiosk on-site — is it still operating at City Centre Mall Kamalpokhari?',
        status: ReportStatus.PENDING,
      },
    });
    console.log(' Created sample report for admin moderation testing');
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
