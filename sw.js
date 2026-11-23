/**
 * Kids Study & Rewards Tracker - PWA Service Worker
 * Handles offline caching, fast launch, and full-screen installation
 */

const CACHE_NAME = 'kst-pwa-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './js/firebase-config.js',
  './js/syllabus.js',
  './js/store.js',
  './js/utils.js',
  './js/components.js',
  './js/auth.js',
  './js/parent-dashboard.js',
  './js/child-dashboard.js',
  './js/admin-dashboard.js',
  './js/app.js'
];

// Install: Cache essential shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching static assets for fast launch');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network First with Cache Fallback strategy
// Ensures users always get latest code when online, but app opens instantly offline
self.addEventListener('fetch', event => {
  // Only handle GET requests for our same-origin assets
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Let Firebase Firestore Cloud API & CDN scripts pass directly to network
  if (url.origin.includes('firestore.googleapis.com') || 
      url.origin.includes('firebaseapp.com') ||
      url.origin.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request);
      })
  );
});
