// Service worker minimal untuk SITAGIH (GitHub Pages).
// Tujuannya HANYA supaya Chrome menganggap halaman ini "installable"
// (syarat PWA sah) dan membuatkan WebAPK resmi saat "Install app"/
// "Add to Home screen" — BUKAN untuk offline penuh. Isi aplikasi
// sebenarnya (dashboard, cetak surat, data tunggakan) ada di domain
// script.google.com (beda origin, di dalam iframe) dan tetap butuh
// koneksi internet aktif seperti biasa.

const CACHE_NAME = 'sitagih-shell-v1';
const APP_SHELL = [
  './',
  './index.html',
  './favicon.ico',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon-48x48.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(APP_SHELL); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (k) { return k !== CACHE_NAME; })
              .map(function (k) { return caches.delete(k); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Hanya menangani request ke file shell kita sendiri (same-origin
// GitHub Pages: index.html, ikon, manifest). Request ke
// script.google.com (isi aplikasi di dalam iframe) atau ke CDN lain
// SENGAJA dibiarkan lewat langsung ke jaringan, tidak dicache, supaya
// data tunggakan selalu yang terbaru & proses login Google tidak
// terganggu oleh service worker ini.
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});
