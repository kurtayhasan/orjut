'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Wallet, TrendingUp, TrendingDown, Filter, Download, Plus, MapPin, Calendar, CreditCard, ChevronRight, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { useCategoryTotals } from '@/hooks/useCategoryTotals';
import { generateSeasonExcel, generateSeasonPDF } from '@/lib/reportGenerator';
import { toast } from 'sonner';

export default function FinancePage() {
  const { transactions, lands, activeSeason, totalExpenses, deleteExpense, updateExpense } = useAppContext();
  const categoryTotals = useCategoryTotals(transactions);
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [deletingTx, setDeletingTx] = useState<any>(null);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const handleExportPDF = () => {
    if (!activeSeason) {
      toast.error("Lütfen önce aktif bir sezon seçin.");
      return;
    }
    generateSeasonPDF(activeSeason, transactions, lands);
    toast.success("PDF Raporu oluşturuldu.");
  };

  const handleExportCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast.error("Dışa aktarılacak işlem bulunamadı.");
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      "Tarih,Kategori,Tutar,Açıklama\n" + 
      filteredTransactions.map(t => {
        const date = new Date(t.date).toLocaleDateString('tr-TR');
        const category = t.category || '';
        const amount = t.amount;
        const desc = t.description || '';
        return `"${date}","${category}","${amount}","${desc}"`;
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finans_raporu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateTx = () => {
    if (editingTx) {
      updateExpense(editingTx.id, { amount: Number(editingTx.amount), description: editingTx.description, category: editingTx.description });
      setEditingTx(null);
    }
  };

  return (
    <div className="space-y-6 pb-48">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Wallet size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Finansal Operasyonlar</h1>
            <p className="text-zinc-500 font-medium text-sm">Nakit akışı ve maliyet analizi</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all"
          >
            <Download size={18} /> Excel İndir (CSV)
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
          >
            <Download size={18} /> PDF
          </button>
        </div>
      </header>

      {/* Lightbox / Receipt Viewer */}
      {viewerImage && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewerImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setViewerImage(null)}>
            <X size={24} />
          </button>
          <img src={viewerImage} alt="Fiş" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg mb-4">İşlemi Düzenle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Tutar (₺)</label>
                <input type="number" value={editingTx.amount} onChange={e => setEditingTx({...editingTx, amount: e.target.value})} className="w-full border-2 border-zinc-100 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">Açıklama (Kategori)</label>
                <select 
                  value={editingTx.description} 
                  onChange={e => setEditingTx({...editingTx, description: e.target.value, category: e.target.value})} 
                  className="w-full border-2 border-zinc-100 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 font-bold bg-white"
                >
                  {['Mazot', 'Gübre', 'İlaç', 'Tohum', 'İşçilik', 'Diğer'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setEditingTx(null)} className="flex-1 py-2 font-bold text-zinc-500 bg-zinc-100 rounded-xl hover:bg-zinc-200">İptal</button>
              <button onClick={handleUpdateTx} className="flex-1 py-2 font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Transaction Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} />
            </div>
            <h3 className="font-black text-xl mb-2 text-zinc-900">İşlemi Sil</h3>
            <p className="text-zinc-500 font-medium text-sm mb-6">
              Bu işlemi (₺{deletingTx.amount}) silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingTx(null)} className="flex-1 py-3 font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors">İptal</button>
              <button onClick={() => { deleteExpense(deletingTx.id); setDeletingTx(null); }} className="flex-1 py-3 font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-rose-500" />
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Toplam Gider</p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">₺{totalExpenses.toLocaleString()}</h2>
          <div className="mt-4 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-[65%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-emerald-500" />
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Tahmini Gelir</p>
          </div>
          <h2 className="text-3xl font-black text-zinc-900">
            ₺{lands.reduce((sum, l) => sum + ((l.expected_yield_per_decare || 0) * (l.expected_sell_price_unit || 0) * (l.size_decare || 0)), 0).toLocaleString()}
          </h2>
          <div className="mt-4 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[45%] rounded-full"></div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-100 flex flex-col justify-center">
          <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">Maliyet / Dönüm</p>
          <h2 className="text-3xl font-black text-white">
            ₺{(lands.reduce((s, l) => s + l.size_decare, 0) > 0 ? totalExpenses / lands.reduce((s, l) => s + l.size_decare, 0) : 0).toFixed(0)}
          </h2>
          <p className="text-indigo-100 text-[10px] mt-2 font-bold uppercase">Birim verimlilik skoru: İyi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white border-2 border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex flex-col min-h-[500px]">
          <div className="p-5 border-b border-zinc-100 bg-white flex justify-between items-center">
            <h2 className="text-base font-bold text-zinc-900">İşlem Geçmişi</h2>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              {(['all', 'expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${filter === t ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  {t === 'all' ? 'Hepsi' : t === 'expense' ? 'Gider' : 'Gelir'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="divide-y divide-zinc-50 overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-zinc-50 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                      {tx.type === 'expense' ? <CreditCard size={20} /> : <TrendingUp size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900">{tx.category || tx.description}</h4>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-0.5">
                        <Calendar size={12} />
                        {new Date(tx.date).toLocaleDateString('tr-TR')}
                        {tx.lands && (
                          <>
                            <span className="text-zinc-300">•</span>
                            <MapPin size={12} />
                            {tx.lands.block_no}/{tx.lands.parcel_no}
                          </>
                        )}
                        {tx.receipt_url && (
                          <>
                            <span className="text-zinc-300">•</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewerImage(tx.receipt_url!); }}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-1.5 py-0.5 rounded"
                            >
                              <ImageIcon size={12} /> Fişi Gör
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingTx(tx); }} className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingTx(tx); }} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div>
                      <div className={`text-lg font-black tracking-tight ${tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {tx.type === 'expense' ? '-' : '+'}₺{tx.amount.toLocaleString()}
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-right">Başarılı</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-zinc-400 italic">
                <Wallet size={48} className="mb-4 opacity-20" />
                Henüz bir işlem kaydı bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border-2 border-zinc-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Filter size={18} className="text-indigo-600" />
            Kategori Dağılımı
          </h2>
          <div className="space-y-6">
            {Object.entries(categoryTotals).filter(([key]) => key !== 'grandTotal').map(([name, data]: [string, any]) => (
              <div key={name}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="text-sm font-black text-zinc-800 tracking-tight">{name}</h4>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{data.count} İşlem</p>
                  </div>
                  <div className="text-right font-black text-zinc-900">
                    ₺{data.total.toLocaleString()}
                  </div>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, (data.total / totalExpenses) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 text-center">En Çok Harcama</h4>
            <div className="text-center font-black text-zinc-900 text-lg">
              {Object.entries(categoryTotals)
                .filter(([key]) => key !== 'grandTotal')
                .sort((a: any, b: any) => b[1].total - a[1].total)[0]?.[0] || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
