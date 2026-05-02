import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const generateSeasonPDF = (season: any, transactions: any[], lands: any[]) => {

  
  try {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(`Orjut AgTech OS - Sezon Raporu`, 14, 22);
    
    doc.setFontSize(14);
    doc.text(`Sezon: ${season.name}`, 14, 32);
    doc.setFontSize(10);
    doc.text(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 14, 38);

    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const projectedRevenue = lands.reduce((sum, l) => sum + ((l.expected_yield || 0) * (l.expected_price || 0)), 0);
    const projectedProfit = projectedRevenue - totalSpent;

    doc.setFontSize(12);
    doc.text(`Toplam Harcama: ${totalSpent.toLocaleString()} TL`, 14, 50);
    doc.text(`Tahmini Gelir: ${projectedRevenue.toLocaleString()} TL`, 14, 56);
    doc.text(`Tahmini Kar: ${projectedProfit.toLocaleString()} TL`, 14, 62);

    const tableData = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('tr-TR'),
      tx.description,
      tx.land_id ? `Ada ${tx.land_id}` : '-', // Simplification for safety
      `${tx.amount.toLocaleString()} TL`
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['Tarih', 'İşlem', 'Arazi', 'Tutar']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`${season.name}_Rapor.pdf`);
    return doc.output('blob');
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

export const generateSeasonExcel = (season: any, transactions: any[], lands: any[]) => {

  try {
    const txSheet = XLSX.utils.json_to_sheet(transactions.map(tx => ({
      'Tarih': new Date(tx.date).toLocaleDateString('tr-TR'),
      'Kategori': tx.description,
      'Tutar (TL)': tx.amount
    })));

    const landsSheet = XLSX.utils.json_to_sheet(lands.map(l => ({
      'Arazi': `${l.city}/${l.district}`,
      'Ada/Parsel': `${l.block_no}/${l.parcel_no}`,
      'Büyüklük (Dönüm)': l.size_decare,
      'Ürün': l.crop_type
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, txSheet, 'İşlemler');
    XLSX.utils.book_append_sheet(wb, landsSheet, 'Araziler');

    XLSX.writeFile(wb, `${season.name}_Rapor.xlsx`);
  } catch (error) {
    console.error('Excel Generation Error:', error);
    throw error;
  }
};

export const shareViaWhatsApp = async (pdfBlob: Blob, seasonName: string) => {
  try {
    const file = new File([pdfBlob], `${seasonName}_Rapor.pdf`, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${seasonName} Raporu`,
        text: 'Orjut AgTech OS üzerinden oluşturulan sezon raporu ektedir.',
        files: [file]
      });
    } else {
      toast.info("WhatsApp paylaşımı desteklenmiyor. Dosyayı indirip manuel paylaşın.");
    }
  } catch (err) {
    console.error('Share error:', err);
  }
};
