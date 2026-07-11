import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export function useAppSync(
  activeOrgId: string | null,
  authSession: any,
  setUserProfile: (profile: any) => void,
  setUserRole: (role: any) => void,
  setLands: (lands: any) => void,
  setTotalArea: (area: number) => void,
  setTransactions: (transactions: any) => void,
  setSeasons: (seasons: any) => void,
  setActiveSeason: (season: any) => void,
  setIrrigationLogs: (logs: any) => void,
  setFieldOperations: (ops: any) => void,
  setScoutingLogs: (logs: any) => void,
  setInventory: (inventory: any) => void,
  setTotalExpenses: (expenses: number) => void,
  setDailySpent: (spent: number) => void,
  setIsLoadingLands: (val: boolean) => void,
  setIsLoadingTransactions: (val: boolean) => void,
  setIsLoadingInventory: (val: boolean) => void
) {
  const refreshAllData = useCallback(async () => {
    if (!authSession || !activeOrgId) return;
    const userId = authSession.user.id;

    setIsLoadingLands(true);
    setIsLoadingTransactions(true);
    setIsLoadingInventory(true);

    try {
      const [p, l, t, s, i, fo, sl, inv] = await Promise.all([
        db.getProfile(userId),
        db.getLands(activeOrgId),
        db.getTransactions(activeOrgId, 20),
        db.getSeasons(activeOrgId),
        db.getIrrigationLogs(activeOrgId),
        db.getFieldOperations(activeOrgId),
        db.getScoutingLogs(activeOrgId),
        db.getInventory(activeOrgId)
      ]);

      if (p.data) {
        setUserProfile(p.data);
        const actualRole = p.data.role || 'farmer';
        const overrideRole = typeof window !== 'undefined' ? localStorage.getItem('user_role_override') : null;
        let finalRole = actualRole;
        if (overrideRole) {
          if (actualRole === 'admin') finalRole = overrideRole;
          else if (actualRole === 'engineer' && overrideRole !== 'admin') finalRole = overrideRole;
        }
        setUserRole(finalRole as 'farmer' | 'engineer' | 'admin');
        
        if (finalRole === 'farmer' && typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/engineer'))) {
          window.location.href = '/dashboard';
        }
      }

      setLands(l.data || []);
      setTotalArea(l.data ? l.data.reduce((sum: number, land: any) => sum + Number(land.size_decare || 0), 0) : 0);
      setTransactions(t.data || []);

      if (s.data) {
        setSeasons(s.data);
        setActiveSeason(s.data.find((ss: any) => ss.is_active) || s.data[0] || null);
      } else {
        setSeasons([]);
        setActiveSeason(null);
      }

      setIrrigationLogs(i.data || []);
      setFieldOperations(fo.data || []);
      setScoutingLogs(sl.data || []);
      setInventory(inv.data || []);

      const { data: allTx } = await db.getTransactions(activeOrgId);
      if (allTx) {
        setTotalExpenses(allTx.reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0));
        const todayStr = new Date().toISOString().split('T')[0];
        setDailySpent(allTx.filter((tx: any) => tx.date === todayStr && tx.type === 'expense').reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0));
      }

    } catch (e: any) {
      console.error("Critical Data Fetch Error:", e);
      toast.error(e.message || "Veriler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingLands(false);
      setIsLoadingTransactions(false);
      setIsLoadingInventory(false);
    }
  }, [activeOrgId, authSession, setUserProfile, setUserRole, setLands, setTotalArea, setTransactions, setSeasons, setActiveSeason, setIrrigationLogs, setFieldOperations, setScoutingLogs, setInventory, setTotalExpenses, setDailySpent, setIsLoadingLands, setIsLoadingTransactions, setIsLoadingInventory]);

  useEffect(() => {
    if (activeOrgId) {
      refreshAllData();
    }
  }, [activeOrgId, refreshAllData]);

  return { refreshAllData };
}
