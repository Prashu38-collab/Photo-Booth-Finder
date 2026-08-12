export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Looks up coordinates for an address using Photon (komoot), a free,
 * key-less geocoder backed by OpenStreetMap data.
 * Returns null when the address can't be found.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = /nepal$/i.test(address) ? address : `${address}, Nepal`;
  const params = new URLSearchParams({ q: query, limit: '1' });

  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    console.error(`[geocode] Photon error ${res.status} for "${address}"`);
    return null;
  }

  const data = (await res.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] };
      properties?: Record<string, string>;
    }>;
  };

  const feature = data.features?.[0];
  const coords = feature?.geometry?.coordinates;
  if (!coords || coords.length < 2) {
    console.warn(`[geocode] No result for "${query}"`);
    return null;
  }

  const p = feature.properties || {};
  const displayName = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ');

  return {
    lat: coords[1],
    lng: coords[0],
    displayName: displayName || query,
  };
}
