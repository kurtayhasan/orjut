import { useState, useCallback } from 'react';

export const useAgroMonitoring = () => {
  const [ndviData, setNdviData] = useState<Record<string, number>>({});
  const [loadingNdvi, setLoadingNdvi] = useState<Record<string, boolean>>({});

  const fetchNDVI = useCallback(async (polygonId: string) => {
    if (!polygonId || polygonId === 'none') return null;
    
    setLoadingNdvi(prev => ({ ...prev, [polygonId]: true }));
    try {
      const apiKey = process.env.NEXT_PUBLIC_AGROMONITORING_API_KEY;
      if (!apiKey) throw new Error("API key is missing");
      
      const start = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000); // 30 days ago in unix seconds
      const end = Math.floor(Date.now() / 1000);
      
      const res = await fetch(`https://api.agromonitoring.com/agro/1.0/ndvi/history?polyid=${polygonId}&start=${start}&end=${end}&appid=${apiKey}`);
      if (!res.ok) throw new Error("Failed to fetch NDVI");
      
      const data = await res.json();
      const mean = data[0]?.dt ? data[0].data.mean : null;
      
      if (mean !== null) {
        setNdviData(prev => ({ ...prev, [polygonId]: mean }));
      }
      return mean;
    } catch(e) { 
      console.error("NDVI Error:", e);
      return null; 
    } finally {
      setLoadingNdvi(prev => ({ ...prev, [polygonId]: false }));
    }
  }, []);

  return { ndviData, loadingNdvi, fetchNDVI };
};
