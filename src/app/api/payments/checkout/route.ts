import { NextResponse } from 'next/server';
import { PAYMENT_CONFIG } from '@/lib/payments/config';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { packageId } = await req.json();

    const selectedPackage = PAYMENT_CONFIG.packages[packageId as keyof typeof PAYMENT_CONFIG.packages];
    
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Geçersiz paket seçimi' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    // --- PAYTR ENTEGRASYONU (ÖRNEK SKELETON) ---
    // Gerekli PayTR değişkenlerini .env dosyasından alıyoruz
    const merchant_id = process.env.PAYTR_MERCHANT_ID;
    const merchant_key = process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_id || !merchant_key || !merchant_salt) {
      // Eğer anahtarlar yoksa (geliştirme ortamı), dummy bir url döndür veya hata ver
      console.warn("PayTR API anahtarları eksik. Sistem gerçek ödeme alamaz.");
      // throw new Error("Ödeme sistemi yapılandırılmamış.");
      return NextResponse.json({ 
        checkoutUrl: `https://orjut.test/payment-simulation?userId=${user.id}&packageId=${packageId}` 
      });
    }

    const merchant_oid = `ORDER_${Date.now()}_${user.id}`;
    const email = user.email || 'musteri@orjut.com';
    const payment_amount = selectedPackage.price * 100; // PayTR kuruş bekler
    
    const user_ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const user_basket = Buffer.from(JSON.stringify([[selectedPackage.name, selectedPackage.price.toString(), 1]])).toString('base64');
    const no_installment = 0; // Taksit yapılmasın isteniyorsa 1, yapılsın isteniyorsa 0
    const max_installment = 12;
    const currency = PAYMENT_CONFIG.currency;
    const test_mode = process.env.NODE_ENV === 'development' ? 1 : 0;
    
    // Hash oluşturma
    const hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
    const paytr_token = crypto.createHmac('sha256', merchant_key).update(hash_str + merchant_salt).digest('base64');
    
    // PayTR'ye istek atıp token almalıyız (Gerçek entegrasyonda formData ile POST atılır)
    const formData = new URLSearchParams();
    formData.append('merchant_id', merchant_id);
    formData.append('user_ip', user_ip);
    formData.append('merchant_oid', merchant_oid);
    formData.append('email', email);
    formData.append('payment_amount', payment_amount.toString());
    formData.append('paytr_token', paytr_token);
    formData.append('user_basket', user_basket);
    formData.append('debug_on', '1');
    formData.append('no_installment', no_installment.toString());
    formData.append('max_installment', max_installment.toString());
    formData.append('user_name', user.user_metadata?.full_name || 'Kullanici');
    formData.append('user_address', 'Belirtilmedi');
    formData.append('user_phone', user.user_metadata?.phone || '05555555555');
    formData.append('merchant_ok_url', `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?payment=success`);
    formData.append('merchant_fail_url', `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?payment=fail`);
    formData.append('timeout_limit', '30');
    formData.append('currency', currency);
    formData.append('test_mode', test_mode.toString());

    const paytrRes = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const paytrData = await paytrRes.json();

    if (paytrData.status === 'success') {
      // Başarılı token alındı, kullanıcıyı PayTR güvenli ödeme sayfasına yönlendir (veya frontend'de iframe içinde aç)
      const checkoutUrl = `https://www.paytr.com/odeme/guvenli/${paytrData.token}`;
      return NextResponse.json({ checkoutUrl });
    } else {
      console.error("PayTR Token Error:", paytrData.reason);
      throw new Error(`PayTR hatası: ${paytrData.reason}`);
    }

  } catch (error: any) {
    console.error("Checkout api error:", error);
    return NextResponse.json({ error: 'Ödeme oturumu oluşturulamadı.' }, { status: 500 });
  }
}
