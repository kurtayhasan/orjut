export const fetchGeocodingSearch = async (query: string) => {
  const res = await fetch(`/api/geocode?type=search&q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Geocoding search failed');
  return res.json();
};

export const fetchGeocodingReverse = async (lat: number, lon: number) => {
  const res = await fetch(`/api/geocode?type=reverse&lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Geocoding reverse failed');
  return res.json();
};
