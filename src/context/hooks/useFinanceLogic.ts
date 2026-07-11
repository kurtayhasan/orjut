import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/db';
import { Transaction, InventoryItem, Season } from '@/types';

export function useFinanceLogic(
  activeOrgId: string | null, 
  activeSeason: Season | null
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [dailySpent, setDailySpent] = useState<number>(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  const calculateUnitCost = useCallback((amount: number, quantity: number) => {
    if (!quantity || quantity <= 0) return 0;
    return amount / quantity;
  }, []);

  const updateInventoryItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await db.updateInventoryItem(id, updates);
      if (error) throw error;
      setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } catch (err) {
      toast.error("Stok güncellenemedi. Lütfen tekrar deneyiniz.");
    }
  }, []);

  const addInventoryItem = useCallback(async (item: any) => {
    if (!activeOrgId) return;
    try {
      const { data, error } = await db.insertInventoryItem({ ...item, org_id: activeOrgId });
      if (error) throw error;
      if (data) setInventory(prev => [...prev, data]);
    } catch (err: any) {
      toast.error(err.message || "Stok eklenirken bir hata oluştu.");
    }
  }, [activeOrgId]);

  const deleteInventoryItem = useCallback(async (id: string) => {
    try {
      const { error } = await db.deleteInventoryItem(id);
      if (error) throw error;
      setInventory(prev => prev.filter(i => i.id !== id));
      toast.success("Silindi");
    } catch (err) {
      toast.error("Stok silinemedi. Lütfen tekrar deneyiniz.");
    }
  }, []);

  const addExpense = useCallback(async (
    amount: number, 
    category: string, 
    date: string, 
    land_id: string, 
    description: string,
    receipt_url?: string, 
    receipt_thumbnail_url?: string, 
    inventoryData?: { name: string, type: string, quantity: number, unit: string, id?: string }, 
    season_id?: string,
    hybridData?: { appliedAmount: number, landId: string, type: string },
    addFieldOperation?: (op: any) => Promise<void>
  ) => {
    if (!activeOrgId) return;
    const newTx: any = { 
      amount, description: description || category, date, type: 'expense', category, land_id, org_id: activeOrgId,
      quantity: inventoryData?.quantity, unit: inventoryData?.unit, receipt_url, receipt_thumbnail_url,
      season_id: season_id || activeSeason?.id
    };
    try {
      const { data, error } = await db.insertTransaction(newTx);
      if (error) throw error;
      if (data) {
        setTransactions(prev => [data, ...prev]);
        setTotalExpenses(prev => prev + amount);
        
        let targetInventoryId = inventoryData?.id;

        if (inventoryData) {
          const unitCost = calculateUnitCost(amount, inventoryData.quantity);
          
          if (inventoryData.id) {
            const item = inventory.find(i => i.id === inventoryData.id);
            if (item) {
              const newQty = item.quantity + inventoryData.quantity;
              await updateInventoryItem(item.id, { 
                quantity: newQty,
                unit_cost: unitCost,
                last_purchase_date: date
              });
              toast.success("Harcama kaydedildi ve mevcut stok güncellendi");
            }
          } else {
            const { data: invItem } = await db.insertInventoryItem({ 
              org_id: activeOrgId,
              item_name: inventoryData.name, 
              type: inventoryData.type as any, 
              quantity: inventoryData.quantity, 
              unit: inventoryData.unit, 
              unit_cost: unitCost, 
              last_purchase_date: date 
            });
            if (invItem) {
              setInventory(prev => [invItem, ...prev]);
              targetInventoryId = invItem.id;
              toast.success("Harcama kaydedildi ve yeni stok oluşturuldu");
            }
          }

          if (hybridData && targetInventoryId && addFieldOperation) {
            await addFieldOperation({
              land_id: hybridData.landId,
              type: hybridData.type as any,
              date,
              amount: hybridData.appliedAmount,
              unit: inventoryData.unit,
              method: 'Satın alma sonrası doğrudan uygulama',
              notes: 'Satın alınan miktarın bir kısmı arazide kullanıldı.',
              inventory_id: targetInventoryId
            });
            toast.success("Hibrit işlem: Alım yapıldı ve araziye uygulandı.");
          }
        } else {
          toast.success("Masraf başarıyla kaydedildi");
        }
      }
    } catch (err: any) {
      toast.error("Hata: " + err.message);
    }
  }, [activeOrgId, activeSeason, inventory, updateInventoryItem, calculateUnitCost]);

  const updateExpense = useCallback(async (id: string, updates: any) => {
    try {
      const { error } = await db.updateTransaction(id, updates);
      if (error) throw error;
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast.success("İşlem güncellendi");
    } catch (err: any) {
      toast.error("Masraf güncellenemedi. Lütfen tekrar deneyiniz.");
    }
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const tx = transactions.find(t => t.id === id);
      const { error } = await db.deleteTransaction(id);
      if (error) throw error;
      if (tx) setTotalExpenses(prev => prev - Number(tx.amount || 0));
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success("İşlem silindi");
    } catch (err: any) {
      toast.error("Masraf silinemedi. Lütfen tekrar deneyiniz.");
    }
  }, [transactions]);

  const logSaving = useCallback(async (amount: number, reason: string) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    if (!userId) return;
    try {
      await db.insertSavingLog({ user_id: userId, amount, reason });
      setTotalSavings(prev => prev + amount);
    } catch (err: any) {
      toast.error(err.message || "Tasarruf günlüğü kaydedilirken bir hata oluştu.");
    }
  }, []);

  return {
    transactions, setTransactions,
    totalExpenses, setTotalExpenses,
    totalSavings, setTotalSavings,
    dailySpent, setDailySpent,
    inventory, setInventory,
    isLoadingTransactions, setIsLoadingTransactions,
    isLoadingInventory, setIsLoadingInventory,
    calculateUnitCost, addExpense, updateExpense, deleteExpense, logSaving,
    addInventoryItem, updateInventoryItem, deleteInventoryItem
  };
}
