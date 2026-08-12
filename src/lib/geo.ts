/**
 * Calculate the Haversine distance between two points on the Earth (in km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 100) / 100;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export const KATHMANDU_VALLEY_CENTER = {
  lat: 27.7172,
  lng: 85.3240,
  zoom: 13,
};

export const KATHMANDU_POPULAR_AREAS = [
  { name: 'Civil Mall', lat: 27.7006, lng: 85.3134 },
  { name: 'Kamalpokhari', lat: 27.7128, lng: 85.3212 },
  { name: 'Kathmandu', lat: 27.7172, lng: 85.3240 },
  { name: 'Thamel', lat: 27.7152, lng: 85.3123 },
  { name: 'Durbar Marg', lat: 27.7110, lng: 85.3175 },
  { name: 'Lazimpat', lat: 27.7144, lng: 85.3106 },
  { name: 'Patan', lat: 27.6728, lng: 85.3255 },
  { name: 'Pulchowk', lat: 27.6775, lng: 85.3168 },
];
