/**
 * Lightweight GeoJSON helpers (no Turf dependency).
 */

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  const la = Number(lat);
  const lo = Number(lng);
  return (
    !Number.isNaN(la) &&
    !Number.isNaN(lo) &&
    la >= -90 &&
    la <= 90 &&
    lo >= -180 &&
    lo <= 180
  );
}

export function stripHeavyGeometry<T extends Record<string, unknown>>(
  land: T
): Omit<T, 'geometry' | 'boundaries'> {
  const { geometry: _g, boundaries: _b, ...rest } = land as T & {
    geometry?: unknown;
    boundaries?: unknown;
  };
  return rest;
}
