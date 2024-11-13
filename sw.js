// Nama cache dan versi cache
const CACHE_NAME = 'portofolio-cache-v2';

// Daftar file untuk cache (update daftar ini sesuai dengan file di proyek Anda)
const urlsToCache = [
    '/',
    '/index.html',
    '/css/bootstrap.css',
    '/css/fontawesome-all.css',
    '/css/styles.css',
    '/icons/icon_192x192.png',
    '/icons/icon_512x512.png',
    '/images/background.png',
    '/images/bg.png',
    '/images/bgfix.png',
    '/images/details-icon-bootstrap.png',
    '/images/details-icon-css.png',
    '/images/details-icon-html.png',
    '/images/details-icon-illustrator.png',
    '/images/details-icon-javascript.png',
    '/images/details-icon-photoshop.png',
    '/images/down-arrow.png',
    '/images/logo.svg',
    '/images/logo1.png',
    '/images/logo2.png',
    '/images/projek1.png',
    '/images/projek2.png',
    '/images/projek3.png',
    '/images/projek4.png',
    '/images/projek5.jpg',
    '/images/projek6.jpg',
    '/images/up-arrow.png',
    '/js/bootstrap.min.js',
    '/js/jquery.easing.min.js',
    '/js/jquery.min.js',
    '/js/scripts.js',
    '/manifest.json'
];

// Instal Service Worker dan simpan file yang diperlukan ke dalam cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Aktifkan Service Worker dan hapus cache lama jika ada
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Ambil file dari cache saat offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Jika file ada di cache, kembalikan file dari cache
                if (response) {
                    return response;
                }
                // Jika tidak ada di cache, ambil dari jaringan
                return fetch(event.request).then(response => {
                    // Jika respons tidak valid, kembalikan langsung
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Klon respons agar dapat disimpan di cache
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Jika offline dan file tidak ada di cache, tampilkan fallback (jika ada)
                return caches.match('/fallback.html');
            })
    );
});

// Event untuk mengatur instalasi aplikasi (PWA)
self.addEventListener('beforeinstallprompt', event => {
    // Blokir prompt instalasi default dan simpan event
    event.preventDefault();
    let deferredPrompt = event;
    document.getElementById('installButton').addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
});
