import { useMemo } from 'react';
import { CategoryTotals } from '@/types';

export function useCategoryTotals(transactions: any[]) {
  return useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {
      'Mazot': { total: 0, count: 0 },
      'Gübre': { total: 0, count: 0 },
      'İlaç': { total: 0, count: 0 },
      'İşçilik': { total: 0, count: 0 },
      'Diğer': { total: 0, count: 0 }
    };

    let grandTotal = 0;

    transactions.forEach(tx => {
      const cat = tx.description;
      if (stats[cat]) {
        stats[cat].total += tx.amount;
        stats[cat].count += 1;
        grandTotal += tx.amount;
      } else {
        // Fallback for others
        stats['Diğer'].total += tx.amount;
        stats['Diğer'].count += 1;
        grandTotal += tx.amount;
      }
    });

    return {
      mazot: { ...stats['Mazot'], percentage: grandTotal ? Math.round((stats['Mazot'].total / grandTotal) * 100) : 0 },
      gubre: { ...stats['Gübre'], percentage: grandTotal ? Math.round((stats['Gübre'].total / grandTotal) * 100) : 0 },
      ilac: { ...stats['İlaç'], percentage: grandTotal ? Math.round((stats['İlaç'].total / grandTotal) * 100) : 0 },
      isci: { ...stats['İşçilik'], percentage: grandTotal ? Math.round((stats['İşçilik'].total / grandTotal) * 100) : 0 },
      diger: { ...stats['Diğer'], percentage: grandTotal ? Math.round((stats['Diğer'].total / grandTotal) * 100) : 0 },
      grandTotal
    };
  }, [transactions]);
}
