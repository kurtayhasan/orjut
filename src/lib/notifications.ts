import { supabase } from './supabase';
import { toast } from 'sonner';

export const requestNotificationPermission = async () => {
  if (!('serviceWorker' in navigator)) {
    toast.error("Tarayıcınız servis çalışanlarını desteklemiyor.");
    return false;
  }

  if (!('PushManager' in window)) {
    toast.error("Tarayıcınız anlık bildirimleri desteklemiyor.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      toast.error("Bildirim izni reddedildi.");
      return false;
    }

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // Use a public VAPID key (mocked for demo purposes)
    const publicVapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
    }

    // Save subscription to Supabase
    const { error } = await supabase.from('push_subscriptions').insert([{
      subscription: subscription.toJSON(),
      org_id: '00000000-0000-0000-0000-000000000000' // mock org id
    }]);

    if (!error) {
      toast.success("Bildirimler başarıyla aktifleştirildi!");
      return true;
    } else {
      toast.error("Bildirim ayarları kaydedilirken hata oluştu.");
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    toast.error("Bildirimler ayarlanırken beklenmeyen bir hata oluştu.");
    return false;
  }
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
