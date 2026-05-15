'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            // Check for notifications if supported
            if ('Notification' in window && Notification.permission === 'default') {
              Notification.requestPermission();
            }
          },
          function(err) {
            console.error('Service Worker registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
