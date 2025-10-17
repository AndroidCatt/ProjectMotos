// Service Worker - PWA Nivel 8
// Permite funcionamiento offline y caché inteligente

const CACHE_VERSION = 'v8.0.0';
const CACHE_NAME = `chatbot-repuestos-${CACHE_VERSION}`;

// Archivos críticos que siempre se cachean
const CRITICAL_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/chatbot.js',
    '/app.js',
    '/app-v6.js',
    '/app-v7.js',
    '/app-v8.js',
    '/ai-engine.js',
    '/auth-system.js',
    '/checkout-system.js',
    '/training-system.js',
    '/voice-and-export.js',
    '/pwa-system.js',
    '/review-system.js',
    '/admin-dashboard.js',
    '/wishlist-share.js'
];

// Archivos externos (CDN)
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ============================================
// INSTALACIÓN DEL SERVICE WORKER
// ============================================

self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker v8.0...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando archivos críticos...');
                return cache.addAll(CRITICAL_ASSETS.concat(EXTERNAL_ASSETS));
            })
            .then(() => {
                console.log('[SW] Archivos cacheados exitosamente');
                return self.skipWaiting(); // Activar inmediatamente
            })
            .catch((error) => {
                console.error('[SW] Error al cachear archivos:', error);
            })
    );
});

// ============================================
// ACTIVACIÓN DEL SERVICE WORKER
// ============================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker v8.0...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // Eliminar cachés antiguos
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service Worker activado');
                return self.clients.claim(); // Tomar control de todas las páginas
            })
    );
});

// ============================================
// ESTRATEGIAS DE CACHÉ
// ============================================

// Estrategia: Network First (intenta red, luego caché)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // Si la respuesta es válida, actualizar caché
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Si falla la red, usar caché
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[SW] Sirviendo desde caché:', request.url);
            return cachedResponse;
        }

        // Si no hay caché, retornar página offline
        return caches.match('/index.html');
    }
}

// Estrategia: Cache First (intenta caché, luego red)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        console.log('[SW] Sirviendo desde caché:', request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[SW] Error en red y caché:', error);
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
    }
}

// Estrategia: Stale While Revalidate (usa caché pero actualiza en background)
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    });

    return cachedResponse || fetchPromise;
}

// ============================================
// INTERCEPCIÓN DE REQUESTS
// ============================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requests que no sean GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignorar chrome-extension y otros protocolos
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Determinar estrategia según el tipo de recurso
    if (CRITICAL_ASSETS.some(asset => url.pathname.includes(asset))) {
        // Archivos críticos: Cache First
        event.respondWith(cacheFirst(request));
    } else if (url.pathname.includes('/api/')) {
        // APIs: Network First
        event.respondWith(networkFirst(request));
    } else if (url.hostname !== self.location.hostname) {
        // CDN externos: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else {
        // Por defecto: Network First
        event.respondWith(networkFirst(request));
    }
});

// ============================================
// NOTIFICACIONES PUSH
// ============================================

self.addEventListener('push', (event) => {
    console.log('[SW] Notificación Push recibida');

    let notificationData = {
        title: 'Repuestos de Motos',
        body: 'Tienes una nueva actualización',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'default',
        requireInteraction: false
    };

    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data || {},
            actions: notificationData.actions || [
                { action: 'open', title: 'Ver' },
                { action: 'close', title: 'Cerrar' }
            ]
        })
    );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Click en notificación:', event.action);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// ============================================
// SINCRONIZACIÓN EN BACKGROUND
// ============================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Sincronización en background:', event.tag);

    if (event.tag === 'sync-orders') {
        event.waitUntil(syncOrders());
    } else if (event.tag === 'sync-cart') {
        event.waitUntil(syncCart());
    }
});

async function syncOrders() {
    try {
        // Aquí iría la lógica de sincronización con backend
        console.log('[SW] Sincronizando pedidos...');

        // Por ahora solo simular
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('[SW] Pedidos sincronizados');
        return true;
    } catch (error) {
        console.error('[SW] Error sincronizando pedidos:', error);
        return false;
    }
}

async function syncCart() {
    try {
        console.log('[SW] Sincronizando carrito...');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[SW] Carrito sincronizado');
        return true;
    } catch (error) {
        console.error('[SW] Error sincronizando carrito:', error);
        return false;
    }
}

// ============================================
// MENSAJES DESDE LA APLICACIÓN
// ============================================

self.addEventListener('message', (event) => {
    console.log('[SW] Mensaje recibido:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    } else if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// ============================================
// MANEJO DE ERRORES
// ============================================

self.addEventListener('error', (event) => {
    console.error('[SW] Error en Service Worker:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('[SW] Promesa rechazada no manejada:', event.reason);
});

console.log('[SW] Service Worker v8.0 cargado');
