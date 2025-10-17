// PWA System - Sistema de Progressive Web App v8.0
// Maneja instalación, notificaciones push, y modo offline

class PWASystem {
    constructor() {
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.deferredPrompt = null;
        this.notificationPermission = 'default';
        this.installPromptShown = false;

        this.init();
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    async init() {
        console.log('[PWA] Inicializando sistema PWA v8.0...');

        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            await this.registerServiceWorker();
        }

        // Configurar listeners de conectividad
        this.setupConnectivityListeners();

        // Configurar listener de instalación
        this.setupInstallPrompt();

        // Verificar permisos de notificaciones
        await this.checkNotificationPermission();

        // Configurar sincronización en background
        this.setupBackgroundSync();

        console.log('[PWA] Sistema PWA inicializado');
    }

    // ============================================
    // SERVICE WORKER
    // ============================================

    async registerServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('[PWA] Service Worker registrado:', this.swRegistration.scope);

            // Listener para actualizaciones del SW
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });

            return this.swRegistration;
        } catch (error) {
            console.error('[PWA] Error registrando Service Worker:', error);
            return null;
        }
    }

    showUpdateNotification() {
        if (window.showNotification) {
            window.showNotification(
                '¡Nueva versión disponible! Recarga la página para actualizar.',
                'info',
                10000
            );
        }

        // Agregar botón de actualización
        const updateButton = document.createElement('button');
        updateButton.textContent = '🔄 Actualizar Ahora';
        updateButton.className = 'update-app-btn';
        updateButton.onclick = () => {
            if (this.swRegistration && this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        };

        document.body.appendChild(updateButton);
    }

    async getServiceWorkerVersion() {
        if (!this.swRegistration) return 'Unknown';

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                resolve(event.data.version || 'Unknown');
            };

            this.swRegistration.active.postMessage(
                { type: 'GET_VERSION' },
                [messageChannel.port2]
            );
        });
    }

    // ============================================
    // INSTALACIÓN DE PWA
    // ============================================

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('[PWA] Prompt de instalación disponible');

            // Prevenir el prompt automático
            e.preventDefault();

            // Guardar el evento para mostrarlo después
            this.deferredPrompt = e;

            // Mostrar botón de instalación personalizado
            this.showInstallButton();
        });

        // Detectar cuando la app fue instalada
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App instalada exitosamente');
            this.deferredPrompt = null;
            this.hideInstallButton();

            if (window.showNotification) {
                window.showNotification('¡App instalada correctamente! 🎉', 'success');
            }

            // Guardar evento
            this.trackEvent('pwa_installed');
        });
    }

    showInstallButton() {
        if (this.installPromptShown) return;

        const installBanner = document.createElement('div');
        installBanner.id = 'pwa-install-banner';
        installBanner.className = 'pwa-install-banner';
        installBanner.innerHTML = `
            <div class="install-content">
                <div class="install-icon">📱</div>
                <div class="install-text">
                    <strong>Instalar App</strong>
                    <p>Usa esta app sin conexión y accede más rápido</p>
                </div>
                <div class="install-actions">
                    <button class="btn-install" onclick="pwaSystem.installApp()">Instalar</button>
                    <button class="btn-dismiss" onclick="pwaSystem.dismissInstall()">✕</button>
                </div>
            </div>
        `;

        document.body.appendChild(installBanner);
        this.installPromptShown = true;

        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            if (this.deferredPrompt) {
                this.dismissInstall();
            }
        }, 10000);
    }

    hideInstallButton() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.remove();
        }
        this.installPromptShown = false;
    }

    async installApp() {
        if (!this.deferredPrompt) {
            console.log('[PWA] No hay prompt de instalación disponible');
            return;
        }

        // Mostrar el prompt de instalación
        this.deferredPrompt.prompt();

        // Esperar la respuesta del usuario
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('[PWA] Usuario respondió:', outcome);

        if (outcome === 'accepted') {
            this.trackEvent('pwa_install_accepted');
        } else {
            this.trackEvent('pwa_install_dismissed');
        }

        // Limpiar el prompt
        this.deferredPrompt = null;
        this.hideInstallButton();
    }

    dismissInstall() {
        this.hideInstallButton();
        this.trackEvent('pwa_install_banner_dismissed');
    }

    // ============================================
    // NOTIFICACIONES PUSH
    // ============================================

    async checkNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('[PWA] Notificaciones no soportadas');
            return 'unsupported';
        }

        this.notificationPermission = Notification.permission;
        return this.notificationPermission;
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return 'unsupported';
        }

        try {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission;

            if (permission === 'granted') {
                console.log('[PWA] Permiso de notificaciones concedido');
                await this.subscribeToPushNotifications();
                this.trackEvent('notifications_enabled');
            } else {
                console.log('[PWA] Permiso de notificaciones denegado');
                this.trackEvent('notifications_denied');
            }

            return permission;
        } catch (error) {
            console.error('[PWA] Error solicitando permiso:', error);
            return 'error';
        }
    }

    async subscribeToPushNotifications() {
        if (!this.swRegistration) {
            console.error('[PWA] Service Worker no registrado');
            return null;
        }

        try {
            // Aquí iría la clave pública VAPID del servidor
            // Por ahora simular la suscripción
            const subscription = await this.swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(
                    'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrUM-P_Q5FH_TGJlWxEPP1jjM1iVhYhfGCj2TvxP1R7gBGVNGZA'
                )
            });

            console.log('[PWA] Suscrito a notificaciones push:', subscription);

            // Aquí enviarías la suscripción al servidor
            await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('[PWA] Error suscribiendo a push:', error);
            return null;
        }
    }

    urlBase64ToUint8Array(base64String) {
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

    async sendSubscriptionToServer(subscription) {
        // Aquí enviarías la suscripción a tu backend
        console.log('[PWA] Enviando suscripción al servidor...');

        // Guardar localmente por ahora
        localStorage.setItem('push_subscription', JSON.stringify(subscription));

        return true;
    }

    async showLocalNotification(title, options = {}) {
        if (this.notificationPermission !== 'granted') {
            console.log('[PWA] Sin permiso para notificaciones');
            return null;
        }

        if (!this.swRegistration) {
            // Notificación del navegador si no hay SW
            return new Notification(title, options);
        }

        // Notificación desde Service Worker
        return this.swRegistration.showNotification(title, {
            icon: '/icon-192.png',
            badge: '/badge-72.png',
            vibrate: [200, 100, 200],
            ...options
        });
    }

    // ============================================
    // CONECTIVIDAD
    // ============================================

    setupConnectivityListeners() {
        window.addEventListener('online', () => {
            console.log('[PWA] Conexión restaurada');
            this.isOnline = true;
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            console.log('[PWA] Conexión perdida');
            this.isOnline = false;
            this.handleOffline();
        });
    }

    handleOnline() {
        // Ocultar banner offline
        const offlineBanner = document.getElementById('offline-banner');
        if (offlineBanner) {
            offlineBanner.remove();
        }

        // Mostrar notificación
        if (window.showNotification) {
            window.showNotification('✅ Conexión restaurada', 'success');
        }

        // Sincronizar datos pendientes
        this.syncPendingData();

        this.trackEvent('online');
    }

    handleOffline() {
        // Mostrar banner offline
        const offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        offlineBanner.className = 'offline-banner';
        offlineBanner.innerHTML = `
            <div class="offline-content">
                📡 Sin conexión - Trabajando en modo offline
            </div>
        `;

        document.body.appendChild(offlineBanner);

        // Mostrar notificación
        if (window.showNotification) {
            window.showNotification('⚠️ Sin conexión a Internet', 'warning');
        }

        this.trackEvent('offline');
    }

    // ============================================
    // SINCRONIZACIÓN EN BACKGROUND
    // ============================================

    setupBackgroundSync() {
        if (!('sync' in this.swRegistration)) {
            console.log('[PWA] Background Sync no soportado');
            return;
        }

        console.log('[PWA] Background Sync configurado');
    }

    async syncPendingData() {
        if (!this.swRegistration || !('sync' in this.swRegistration)) {
            console.log('[PWA] Background Sync no disponible');
            return;
        }

        try {
            await this.swRegistration.sync.register('sync-orders');
            await this.swRegistration.sync.register('sync-cart');
            console.log('[PWA] Sincronización solicitada');
        } catch (error) {
            console.error('[PWA] Error en sync:', error);
        }
    }

    // ============================================
    // ANALYTICS
    // ============================================

    trackEvent(eventName, eventData = {}) {
        const event = {
            name: eventName,
            timestamp: new Date().toISOString(),
            data: eventData
        };

        // Guardar en localStorage
        const events = JSON.parse(localStorage.getItem('pwa_events') || '[]');
        events.push(event);

        // Mantener solo los últimos 100 eventos
        if (events.length > 100) {
            events.shift();
        }

        localStorage.setItem('pwa_events', JSON.stringify(events));

        console.log('[PWA] Evento:', event);
    }

    getAnalytics() {
        const events = JSON.parse(localStorage.getItem('pwa_events') || '[]');

        return {
            totalEvents: events.length,
            events: events,
            summary: this.summarizeEvents(events)
        };
    }

    summarizeEvents(events) {
        const summary = {};

        events.forEach(event => {
            if (!summary[event.name]) {
                summary[event.name] = 0;
            }
            summary[event.name]++;
        });

        return summary;
    }

    // ============================================
    // UTILIDADES
    // ============================================

    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    getInstallStatus() {
        return {
            isInstalled: this.isStandalone(),
            canInstall: this.deferredPrompt !== null,
            notificationPermission: this.notificationPermission,
            isOnline: this.isOnline,
            serviceWorkerActive: this.swRegistration && this.swRegistration.active !== null
        };
    }

    async clearCache() {
        if (!this.swRegistration) return;

        this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
        console.log('[PWA] Caché limpiado');
    }
}

// Inicializar globalmente
let pwaSystem;

if (typeof window !== 'undefined') {
    window.PWASystem = PWASystem;

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            pwaSystem = new PWASystem();
            window.pwaSystem = pwaSystem;
        });
    } else {
        pwaSystem = new PWASystem();
        window.pwaSystem = pwaSystem;
    }
}
