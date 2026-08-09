import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // PayTR'den gelen veriler
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;

    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;

    if (!merchant_salt || !merchant_key) {
      console.warn("PayTR API anahtarları eksik. Webhook işlenemiyor.");
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    // Hash doğrulaması (Güvenlik)
    const hash_str = merchant_oid + merchant_salt + status + total_amount;
    const expected_hash = crypto
      .createHmac('sha256', merchant_key)
      .update(hash_str)
      .digest('base64');

    if (hash !== expected_hash) {
      console.error("PayTR Webhook: Hash mismatch!");
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
    }

    if (status === 'success') {
      // Ödeme başarılı, veritabanını güncelle
      // merchant_oid formatı: ORD + 13 haneli timestamp + 32 haneli tiresiz UUID
      const strippedUuid = merchant_oid.slice(16); 
      // UUID formatına (8-4-4-4-12) geri çevir:
      const userId = `${strippedUuid.slice(0,8)}-${strippedUuid.slice(8,12)}-${strippedUuid.slice(12,16)}-${strippedUuid.slice(16,20)}-${strippedUuid.slice(20)}`;

      if (!userId) {
        throw new Error("Sipariş ID'sinden kullanıcı ID'si çıkarılamadı.");
      }

      // Veritabanını güncellemek için Service Role Key kullanmalıyız (Admin yetkisi)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId);

      if (error) {
        throw error;
      }
      
      console.log(`[PayTR Webhook] User ${userId} is now premium.`);
      
      // PayTR'ye başarılı yanıtı dönülmeli
      return new NextResponse("OK", { status: 200 });
    } else {
      // Ödeme başarısız
      console.log(`[PayTR Webhook] Payment failed for OID: ${merchant_oid}`);
      return new NextResponse("OK", { status: 200 });
    }

  } catch (err: any) {
    console.error('[PayTR Webhook] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
