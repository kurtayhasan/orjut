import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReceiptUploadProps {
  onUploadSuccess: (url: string, base64?: string) => void;
}

export default function ReceiptUpload({ onUploadSuccess }: ReceiptUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    // Create a local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      uploadFile(file, base64);
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file: File, base64: string) => {
    setIsUploading(true);
    
    if (!window.navigator.onLine) {
      // Offline mode: just pass base64 to be saved locally
      toast.warning('Çevrimdışısınız. Makbuz cihaza kaydedildi.');
      onUploadSuccess('offline-pending', base64);
      setIsUploading(false);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Makbuz yüklenirken bir hata oluştu. Çevrimdışı moda geçiliyor.');
      onUploadSuccess('offline-pending', base64);
    } finally {
      setIsUploading(false);
    }
  };

  if (preview) {
    return (
      <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-zinc-200">
        <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
        <button 
          onClick={() => { setPreview(null); onUploadSuccess(''); }}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X size={16} />
        </button>
        {isUploading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <span className="text-sm font-bold text-zinc-800 animate-pulse">Yükleniyor...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-zinc-200 border-dashed rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Camera className="w-6 h-6 mb-2 text-zinc-400" />
          <p className="text-xs text-zinc-500 font-medium">Makbuz veya fotoğraf ekle</p>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </label>
    </div>
  );
}
