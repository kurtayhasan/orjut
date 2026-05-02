import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export const useMarketPrice = (cropName: string) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [history, setHistory] = useState<{ date: string, price: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cropName) return;

    const fetchPrice = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('market_prices')
          .select('*')
          .eq('crop_name', cropName)
          .order('fetched_at', { ascending: false })
          .limit(7);

        if (data && data.length > 0) {
          setCurrentPrice(data[0].price_per_kg);
          setHistory(data.reverse().map(d => ({
            date: new Date(d.fetched_at).toLocaleDateString('tr-TR'),
            price: d.price_per_kg
          })));
        }
      } catch (err) {
        console.error('Market price fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [cropName]);

  return { currentPrice, history, loading };
};
