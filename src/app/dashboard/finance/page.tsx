'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { 
  Wallet, TrendingUp, TrendingDown, Filter, 
  Download, Plus, MapPin, Calendar, CreditCard, 
  ChevronRight, Edit2, Trash2, X, Image as ImageIcon,
  Search, FileText, PieChart, MoreVertical
} from 'lucide-react';
import { useCategoryTotals } from '@/hooks/useCategoryTotals';
import { exportToPDF, exportToExcel } from '@/lib/reportGenerator';
import { toast } from 'sonner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BaseModal from '@/components/ui/BaseModal';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

export default function FinancePage() {
  const { transactions, lands, totalExpenses, deleteExpense, updateExpense, setIsExpenseModalOpen } = useAppContext();
  const categoryTotals = useCategoryTotals(transactions);
  
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [deletingTx, setDeletingTx] = useState<any>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filter === 'all' || t.type === filter;
      const matchesCategory = selectedCategory === 'all' || t.description === selectedCategory;
      const matchesSearch = t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [transactions, filter, selectedCategory, searchQuery]);

  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const netBalance = totalIncome - totalExpenses;

  const handleExportPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Dışa aktarılacak işlem bulunamadı.");
      return;
    }
    exportToPDF(filteredTransactions, 'Finansal İşlem Raporu');
    toast.success("PDF Raporu oluşturuldu.");
  };

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      toast.error("Dışa aktarılacak işlem bulunamadı.");
      return;
    }
    exportToExcel(filteredTransactions, 'finans_raporu');
    toast.success("Excel Raporu oluşturuldu.");
  };

  const categories = ['Mazot', 'Gübre', 'İlaç', 'Tohum', 'İşçilik', 'Diğer'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-heading text-text-primary tracking-tight">Finansal Takip</h1>
          <p className="text-text-muted font-bold text-sm">Gelir ve giderlerinizi profesyonelce yönetin.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="neutral" onClick={handleExportExcel} leftIcon={<FileText size={18} />}>Excel</Button>
           <Button variant="neutral" onClick={handleExportPDF} leftIcon={<Download size={18} />}>PDF</Button>
            <Button size="md" leftIcon={<Plus size={20} />} onClick={() => setIsExpenseModalOpen(true)}>İşlem Ekle</Button>
        </div>
      </div>

      {/* STATS WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card status="info" padding="lg" className="bg-white border-2 border-border shadow-sm flex flex-col justify-between min-h-[140px]">
           <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Net Durum</p>
              <h2 className={cn(
                "text-3xl font-black font-heading tracking-tight",
                netBalance >= 0 ? "text-success" : "text-danger"
              )}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </h2>
           </div>
           <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
              <span>Mevcut Sezon</span>
              <span className={netBalance >= 0 ? "text-success" : "text-danger"}>
                {netBalance >= 0 ? 'Karda' : 'Zararda'}
              </span>
           </div>
        </Card>

        <Card status="success" padding="lg" className="bg-white border-2 border-border shadow-sm flex flex-col justify-between min-h-[140px]">
           <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam Gelir</p>
              <h2 className="text-3xl font-black font-heading text-success tracking-tight">
                {formatCurrency(totalIncome)}
              </h2>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                 <div className="h-full bg-success w-[40%]" />
              </div>
           </div>
        </Card>

        <Card status="danger" padding="lg" className="bg-white border-2 border-border shadow-sm flex flex-col justify-between min-h-[140px]">
           <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Toplam Gider</p>
              <h2 className="text-3xl font-black font-heading text-danger tracking-tight">
                {formatCurrency(totalExpenses)}
              </h2>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
                 <div className="h-full bg-danger w-[65%]" />
              </div>
           </div>
        </Card>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1">
            <Input 
              placeholder="İşlem açıklaması ara..." 
              leftIcon={<Search size={18} />} 
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
            />
         </div>
         <div className="flex gap-2">
            <Input as="select" value={selectedCategory} onChange={(e: any) => setSelectedCategory(e.target.value)} className="w-40">
               <option value="all">Tüm Kategoriler</option>
               {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Input>
            <div className="bg-surface-2 p-1 rounded-lg border border-border flex shrink-0">
               {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                    filter === t ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text-primary"
                  )}
                >
                  {t === 'all' ? 'Hepsi' : t === 'expense' ? 'Gider' : 'Gelir'}
                </button>
              ))}
            </div>
         </div>
      </div>

      {/* TRANSACTION LIST & CATEGORY SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
         
         {/* History */}
         <div className="lg:col-span-8 space-y-4">
            <Card padding="none" className="overflow-hidden">
               <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
                  <h3 className="text-sm font-black font-heading text-text-primary uppercase tracking-tight">İşlem Geçmişi</h3>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{filteredTransactions.length} İşlem Listelendi</span>
               </div>
               <div className="divide-y divide-border">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surface-2 transition-all group cursor-pointer active:bg-surface-3">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className={cn(
                             "w-11 h-11 rounded-full flex items-center justify-center shrink-0 border border-black/5 shadow-sm",
                             tx.type === 'expense' ? "bg-danger-bg text-danger" : "bg-success-bg text-success"
                           )}>
                              {tx.type === 'expense' ? <CreditCard size={20} /> : <TrendingUp size={20} />}
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold text-text-primary truncate">{tx.category || tx.description}</h4>
                              <div className="flex items-center gap-2 text-xs font-bold text-text-muted mt-0.5">
                                 <Calendar size={12} /> {formatDateShort(tx.date)}
                                 {tx.lands && (
                                   <>
                                     <span className="opacity-30">•</span>
                                     <MapPin size={12} /> {tx.lands.block_no}/{tx.lands.parcel_no}
                                   </>
                                 )}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className={cn(
                                "text-lg font-black font-heading tracking-tight",
                                tx.type === 'expense' ? "text-danger" : "text-success"
                              )}>
                                {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                              </div>
                              {tx.receipt_url && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setViewerImage(tx.receipt_url!); }}
                                  className="text-[10px] font-black text-primary hover:underline uppercase tracking-tighter"
                                >
                                  📄 FİŞİ GÖR
                                </button>
                              )}
                           </div>
                           <button className="p-2 text-text-muted hover:text-text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={20} />
                           </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="İşlem kaydı yok" description="Arama kriterlerinize uygun işlem bulunamadı." emoji="💳" />
                  )}
               </div>
            </Card>
         </div>

         {/* Category Summary */}
         <div className="lg:col-span-4 space-y-4">
            <Card padding="lg" className="sticky top-[88px]">
               <div className="flex items-center gap-2 mb-6">
                  <PieChart size={20} className="text-primary" />
                  <h3 className="text-base font-black font-heading text-text-primary uppercase tracking-tight">Kategori Dağılımı</h3>
               </div>
               <div className="space-y-5">
                  {Object.entries(categoryTotals).filter(([key, val]) => key !== 'grandTotal' && (val as any).total > 0).map(([name, data]: [string, any]) => (
                    <div key={name} className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <div>
                             <h4 className="text-sm font-bold text-text-primary leading-tight">{name}</h4>
                             <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{data.count} Kayıt</p>
                          </div>
                          <div className="text-right font-black text-text-primary text-sm">
                             {formatCurrency(data.total)}
                          </div>
                       </div>
                       <div className="h-2 w-full bg-surface-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${Math.min(100, (data.total / (totalExpenses || 1)) * 100)}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="mt-10 p-5 bg-surface-2 rounded-xl border border-border">
                  <div className="flex flex-col items-center text-center">
                     <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">En Yüksek Gider Kalemi</p>
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm mb-3">
                        🌱
                     </div>
                     <span className="font-black text-text-primary text-lg leading-tight uppercase">Gübreleme</span>
                     <span className="text-xs font-bold text-text-muted mt-1">Giderlerin %42'sini oluşturuyor</span>
                  </div>
               </div>
            </Card>
         </div>
      </div>

      {/* RECEIPT VIEWER MODAL */}
      <BaseModal 
        isOpen={!!viewerImage} 
        onClose={() => setViewerImage(null)}
        title="İşlem Fişi / Belge"
      >
        <div className="flex flex-col items-center py-4">
           {viewerImage && (
             <img 
               src={viewerImage} 
               alt="Belge" 
               className="max-w-full rounded-lg shadow-2xl border-4 border-white"
             />
           )}
           <div className="mt-6 flex gap-4 w-full">
              <Button variant="neutral" fullWidth onClick={() => window.open(viewerImage!, '_blank')}>Yeni Sekmede Aç</Button>
              <Button fullWidth onClick={() => setViewerImage(null)}>Kapat</Button>
           </div>
        </div>
      </BaseModal>

    </div>
  );
}
