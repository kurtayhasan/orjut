import { supabase } from './supabase';
import { toast } from 'sonner';

// ─── VAPID key decoder ────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from(rawData, c => c.charCodeAt(0));
}

// ─── Push Subscription ───────────────────────────────────────────────────────
export async function requestNotificationPermission(orgId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    toast.error('Tarayıcınız anlık bildirimleri desteklemiyor.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error('Bildirim izni reddedildi.');
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_KEY ?? '';
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .insert([{ subscription: subscription.toJSON(), org_id: orgId }]);

    if (error) throw error;

    toast.success('Bildirimler başarıyla aktifleştirildi!');
    return true;
  } catch (err) {
    console.error('Notification setup error:', err);
    toast.error('Bildirimler ayarlanırken bir hata oluştu.');
    return false;
  }
}
