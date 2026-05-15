'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(
          function(registration) {
            // Force Update check
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New content is available; please refresh.
                      console.log('New content available, clearing old caches...');
                      if ('caches' in window) {
                        caches.keys().then(names => {
                          for (let name of names) caches.delete(name);
                        });
                      }
                    }
                  }
                };
              }
            };

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
