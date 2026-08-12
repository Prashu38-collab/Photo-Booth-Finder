import { describe, it, expect } from 'vitest';
import { scoreAndRankBooths, PhotoboothCandidate } from '../src/lib/recommendation';

const sampleCandidates: PhotoboothCandidate[] = [
  {
    id: 'booth-1',
    name: 'Life Four Cuts - Thamel',
    slug: 'life-four-cuts-thamel',
    description: 'Korean 4 cut in Thamel',
    address: 'Thamel',
    area: 'Thamel',
    district: 'Kathmandu',
    latitude: 27.7152,
    longitude: 85.3123,
    priceFrom: 400,
    priceTo: 600,
    verificationStatus: 'VERIFIED',
    isDemoData: false,
    boothType: { id: 'bt-1', name: 'Korean 4-cut', slug: 'korean-4-cut' },
    features: [
      { feature: { id: 'f-1', name: 'Physical Prints', slug: 'physical-prints' } },
      { feature: { id: 'f-2', name: 'Couple Friendly', slug: 'couple-friendly' } },
    ],
    photos: [],
    reviews: [{ rating: 5 }],
    lastVerifiedAt: new Date(),
  },
  {
    id: 'booth-2',
    name: 'Memory Snaps 360 - Baneshwor',
    slug: 'memory-snaps-360-baneshwor',
    description: '360 video booth',
    address: 'Baneshwor',
    area: 'Baneshwor',
    district: 'Kathmandu',
    latitude: 27.6915,
    longitude: 85.3340,
    priceFrom: 800,
    priceTo: 1200,
    verificationStatus: 'NEEDS_VERIFICATION',
    isDemoData: false,
    boothType: { id: 'bt-2', name: '360° Booth', slug: '360-booth' },
    features: [
      { feature: { id: 'f-3', name: '360° Video', slug: '360-video' } },
    ],
    photos: [],
    reviews: [{ rating: 4 }],
    lastVerifiedAt: null,
  },
];

describe('Recommendation Engine Scoring', () => {
  it('ranks Korean 4-cut higher when user prefers Korean 4-cut style in budget', () => {
    const results = scoreAndRankBooths(sampleCandidates, {
      userLocation: { lat: 27.7150, lng: 85.3120 }, // Near Thamel
      budget: '300-500',
      boothTypeSlug: 'korean-4-cut',
    });

    expect(results.length).toBe(2);
    expect(results[0].booth.slug).toBe('life-four-cuts-thamel');
    expect(results[0].matchBadge).toBe('Best Match');
    expect(results[0].reasons.length).toBeGreaterThan(0);
  });

  it('handles missing coordinates or unverified prices gracefully without crashing', () => {
    const incompleteCandidate: PhotoboothCandidate = {
      id: 'booth-3',
      name: 'Incomplete Booth',
      slug: 'incomplete-booth',
      description: 'Missing data',
      address: 'Unknown',
      area: 'Unknown',
      district: 'Kathmandu',
      latitude: 27.7000,
      longitude: 85.3000,
      priceFrom: null,
      priceTo: null,
      verificationStatus: 'UNVERIFIED',
      isDemoData: true,
      boothType: { id: 'bt-3', name: 'Selfie Booth', slug: 'selfie-booth' },
      features: [],
      photos: [],
      reviews: [],
      lastVerifiedAt: null,
    };

    const results = scoreAndRankBooths([incompleteCandidate], {
      budget: '300-500',
    });

    expect(results.length).toBe(1);
    expect(results[0].score).toBeGreaterThan(0);
    expect(results[0].score).toBeLessThanOrEqual(1.0);
  });
});
