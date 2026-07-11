/**
 * Turf.js wrappers for land geometry calculations.
 * Keep heavy GIS math here instead of inside map components.
 */

import * as turf from '@turf/turf';

export function polygonAreaDecare(
  coordinates: number[][] | number[][][]
): number {
  try {
    // Accept ring or polygon coordinates
    const ring = (
      Array.isArray(coordinates[0]?.[0])
        ? (coordinates as number[][][])
        : [coordinates as number[][]]
    ) as number[][][];
    const poly = turf.polygon(ring as any);
    const sqm = turf.area(poly);
    return sqm / 1000; // m² → dekar (1000 m²)
  } catch {
    return 0;
  }
}

export function featureCentroid(
  geojson: GeoJSON.GeoJsonObject
): { lat: number; lng: number } | null {
  try {
    const c = turf.centroid(geojson as any);
    const [lng, lat] = c.geometry.coordinates;
    return { lat, lng };
  } catch {
    return null;
  }
}

export { turf };
