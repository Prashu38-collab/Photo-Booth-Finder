import { calculateHaversineDistance } from './geo';

export interface RecommendationPreferences {
  userLocation?: { lat: number; lng: number };
  targetArea?: string;
  budget?: string; // 'under-300' | '300-500' | '500-1000' | 'above-1000' | 'any'
  boothTypeSlug?: string; // 'korean-4-cut' | 'selfie-booth' | '360-booth' | 'mirror-booth' | 'studio' | 'any'
  groupSize?: string; // 'solo' | 'couple' | 'friends' | 'family' | 'group' | 'any'
  requiredFeatureSlugs?: string[];
}

export interface PhotoboothCandidate {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  area: string;
  district: string;
  latitude: number;
  longitude: number;
  priceFrom: number | null;
  priceTo: number | null;
  verificationStatus: string;
  isDemoData: boolean;
  boothType: {
    id: string;
    name: string;
    slug: string;
  };
  features: {
    feature: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  photos: { url: string; isPrimary: boolean }[];
  reviews: { rating: number }[];
  lastVerifiedAt: Date | null;
}

export interface RecommendationResult {
  booth: PhotoboothCandidate;
  score: number; // 0 to 1
  scoreBreakdown: {
    distanceScore: number;
    priceScore: number;
    styleScore: number;
    featureScore: number;
    ratingScore: number;
    freshnessScore: number;
  };
  distanceKm: number | null;
  reasons: string[];
  matchBadge: 'Best Match' | 'Great Match' | 'Good Match';
}

export function scoreAndRankBooths(
  candidates: PhotoboothCandidate[],
  prefs: RecommendationPreferences
): RecommendationResult[] {
  const results: RecommendationResult[] = [];

  for (const booth of candidates) {
    const reasons: string[] = [];

    // 1. Distance Calculation & Score
    let distanceKm: number | null = null;
    let distanceScore = 0.7; // default fallback if no location specified

    if (prefs.userLocation) {
      distanceKm = calculateHaversineDistance(
        prefs.userLocation.lat,
        prefs.userLocation.lng,
        booth.latitude,
        booth.longitude
      );
      if (distanceKm <= 1.0) {
        distanceScore = 1.0;
        reasons.push(`Super close to you (${distanceKm < 1 ? Math.round(distanceKm * 1000) + 'm' : distanceKm.toFixed(1) + 'km'})`);
      } else if (distanceKm <= 3.0) {
        distanceScore = 0.85;
        reasons.push(`Within convenient distance (${distanceKm.toFixed(1)} km)`);
      } else if (distanceKm <= 8.0) {
        distanceScore = 0.65;
      } else {
        distanceScore = Math.max(0.2, 1.0 - distanceKm / 15);
      }
    } else if (prefs.targetArea && prefs.targetArea.toLowerCase() !== 'all') {
      if (booth.area.toLowerCase().includes(prefs.targetArea.toLowerCase())) {
        distanceScore = 1.0;
        reasons.push(`Located directly in ${booth.area}`);
      } else {
        distanceScore = 0.5;
      }
    }

    // 2. Price Score
    let priceScore = 0.8;
    const minPrice = booth.priceFrom ?? 0;
    const maxPrice = booth.priceTo ?? minPrice;

    if (prefs.budget && prefs.budget !== 'any') {
      let targetMin = 0;
      let targetMax = 999999;

      if (prefs.budget === 'under-300') targetMax = 300;
      else if (prefs.budget === '300-500') { targetMin = 300; targetMax = 500; }
      else if (prefs.budget === '500-1000') { targetMin = 500; targetMax = 1000; }
      else if (prefs.budget === 'above-1000') { targetMin = 1000; targetMax = 999999; }

      // Check overlap
      if (minPrice <= targetMax && maxPrice >= targetMin) {
        priceScore = 1.0;
        reasons.push(`Fits your budget (Rs. ${minPrice}${maxPrice > minPrice ? '–' + maxPrice : ''})`);
      } else {
        priceScore = 0.3;
      }
    } else if (booth.priceFrom) {
      reasons.push(`Clear pricing: Rs. ${minPrice}${maxPrice > minPrice ? '–' + maxPrice : ''}`);
    }

    // 3. Style / Booth Type Score
    let styleScore = 0.7;
    if (prefs.boothTypeSlug && prefs.boothTypeSlug !== 'any') {
      if (booth.boothType.slug === prefs.boothTypeSlug) {
        styleScore = 1.0;
        reasons.push(`Matches your ${booth.boothType.name} style preference`);
      } else {
        styleScore = 0.2;
      }
    }

    // 4. Required Features Score
    let featureScore = 1.0;
    const boothFeatureSlugs = new Set(booth.features.map((f) => f.feature.slug));
    
    // Check group size suitability mapped to features
    const matchedFeatures: string[] = [];
    if (prefs.groupSize && prefs.groupSize !== 'any') {
      const requiredSuitability = `${prefs.groupSize}-friendly`;
      if (boothFeatureSlugs.has(requiredSuitability)) {
        matchedFeatures.push(`${prefs.groupSize.charAt(0).toUpperCase() + prefs.groupSize.slice(1)} friendly`);
      }
    }

    if (prefs.requiredFeatureSlugs && prefs.requiredFeatureSlugs.length > 0) {
      let matchedCount = 0;
      for (const req of prefs.requiredFeatureSlugs) {
        if (boothFeatureSlugs.has(req)) {
          matchedCount++;
        }
      }
      featureScore = matchedCount / prefs.requiredFeatureSlugs.length;
      if (matchedCount > 0) {
        reasons.push(`Includes ${matchedCount} of your required features`);
      }
    }

    if (matchedFeatures.length > 0) {
      reasons.push(...matchedFeatures);
    }

    // 5. Rating Score
    let ratingScore = 0.7;
    if (booth.reviews && booth.reviews.length > 0) {
      const avgRating =
        booth.reviews.reduce((sum, r) => sum + r.rating, 0) / booth.reviews.length;
      ratingScore = avgRating / 5.0;
      if (avgRating >= 4.5) {
        reasons.push(`Highly rated by visitors (${avgRating.toFixed(1)}★)`);
      }
    }

    // 6. Information Freshness Score
    let freshnessScore = 0.5;
    if (booth.verificationStatus === 'VERIFIED') {
      freshnessScore = 1.0;
      reasons.push(`Verified fresh business listing`);
    } else if (booth.verificationStatus === 'NEEDS_VERIFICATION') {
      freshnessScore = 0.6;
    } else {
      freshnessScore = 0.3;
    }

    // Final Weighted Calculation
    // weights: 0.30 distance + 0.25 price + 0.20 style + 0.10 features + 0.10 rating + 0.05 freshness
    const totalScore =
      0.30 * distanceScore +
      0.25 * priceScore +
      0.20 * styleScore +
      0.10 * featureScore +
      0.10 * ratingScore +
      0.05 * freshnessScore;

    const roundedScore = Math.round(totalScore * 100) / 100;

    let matchBadge: 'Best Match' | 'Great Match' | 'Good Match' = 'Good Match';
    if (roundedScore >= 0.82) matchBadge = 'Best Match';
    else if (roundedScore >= 0.68) matchBadge = 'Great Match';

    results.push({
      booth,
      score: roundedScore,
      scoreBreakdown: {
        distanceScore,
        priceScore,
        styleScore,
        featureScore,
        ratingScore,
        freshnessScore,
      },
      distanceKm,
      reasons: reasons.slice(0, 4), // max top 4 reasons
      matchBadge,
    });
  }

  // Sort descending by total score
  results.sort((a, b) => b.score - a.score);

  return results;
}
