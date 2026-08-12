import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance, formatDistance } from '../src/lib/geo';

describe('Haversine Distance Calculator', () => {
  it('calculates correct distance between Thamel and Patan Durbar Square', () => {
    // Thamel: 27.7152, 85.3123
    // Patan: 27.6728, 85.3255
    const distance = calculateHaversineDistance(27.7152, 85.3123, 27.6728, 85.3255);
    expect(distance).toBeGreaterThan(4.0);
    expect(distance).toBeLessThan(5.5);
  });

  it('returns 0 for identical coordinates', () => {
    const distance = calculateHaversineDistance(27.7152, 85.3123, 27.7152, 85.3123);
    expect(distance).toBe(0);
  });

  it('formats distance in meters when under 1km', () => {
    expect(formatDistance(0.45)).toBe('450 m');
  });

  it('formats distance in kilometers when 1km or above', () => {
    expect(formatDistance(2.45)).toBe('2.5 km');
  });
});
