/**
 * Integración Nivel 15 Enterprise v15.0
 * PWA Mobile Enhanced + Offline Sync Advanced
 *
 * Nuevas Funcionalidades v15:
 * - PWA mejorado para móviles (Android/iOS)
 * - Instalación completa como app nativa
 * - Sincronización offline automática
 * - Gestos táctiles avanzados
 * - Optimizaciones móviles
 * - Web Share API
 * - Notificaciones push móvil
 * - Modo standalone completo
 */

(function() {
    'use strict';

    console.log('%c✨ Nivel 15 Enterprise Cargado', 'background: #10b981; color: white; padding: 8px; font-weight: bold; font-size: 14px;');
    console.log('%cPWA Mobile Enhanced v15.0', 'color: #10b981; font-weight: bold;');
    console.log('%cOffline Sync Advanced v15.0', 'color: #10b981; font-weight: bold;');

    // ====================================
    // INICIALIZACIÓN
    // ====================================

    function initV15() {
        console.log('Inicializando Nivel 15...');

        // Verificar dependencias
        if (typeof PWAMobileEnhanced === 'undefined') {
            console.error('PWAMobileEnhanced no está cargado');
            return;
        }

        if (typeof OfflineSyncAdvanced === 'undefined') {
            console.error('OfflineSyncAdvanced no está cargado');
            return;
        }

        // Sistemas ya se inicializaron automáticamente
        setupMobileOptimizations();
        setupShareButtons();
        setupVibrationFeedback();
        addV15Styles();

        console.log('✅ Nivel 15 inicializado correctamente');

        // Notificación móvil
        if (window.pwaMobile && window.pwaMobile.isMobile) {
            setTimeout(() => {
                showV15Notification();
            }, 2000);
        }
    }

    // ====================================
    // OPTIMIZACIONES MÓVILES
    // ====================================

    function setupMobileOptimizations() {
        if (!window.pwaMobile || !window.pwaMobile.isMobile) return;

        // Mejorar área de toque en botones
        document.querySelectorAll('button, .header-btn').forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        });

        // Prevenir zoom accidental en inputs
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.style.fontSize === '' || parseInt(input.style.fontSize) < 16) {
                input.style.fontSize = '16px';
            }
        });

        // Smooth scroll
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // ====================================
    // BOTONES DE COMPARTIR
    // ====================================

    function setupShareButtons() {
        // Agregar botón compartir en productos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-product')) {
                const productId = e.target.dataset.productId;
                if (window.pwaMobile) {
                    window.pwaMobile.shareContent({
                        title: 'Repuestos Motos',
                        text: 'Mira este producto increíble',
                        url: window.location.href
                    });
                }
            }
        });
    }

    // ====================================
    // VIBRACIÓN
    // ====================================

    function setupVibrationFeedback() {
        if (!window.pwaMobile) return;

        // Vibrar al hacer click en botones
        document.addEventListener('click', (e) => {
            if (e.target.closest('button, .header-btn, .btn')) {
                window.pwaMobile.vibrateClick();
            }
        });

        // Vibrar al agregar al carrito (éxito)
        window.addEventListener('cartItemAdded', () => {
            if (window.pwaMobile) {
                window.pwaMobile.vibrateSuccess();
            }
        });
    }

    // ====================================
    // NOTIFICACIÓN v15
    // ====================================

    function showV15Notification() {
        if (window.pwaMobile && window.pwaMobile.isStandalone) {
            // Ya está instalada
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'v15-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">📱</div>
                <div class="notification-text">
                    <strong>¡Instala la App!</strong>
                    <p>Úsala sin conexión y como app nativa</p>
                    <button class="btn-install-notif" onclick="window.pwaMobile.installPWA()">
                        Instalar Ahora
                    </button>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);

        // Auto-cerrar después de 10 segundos
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 10000);
    }

    // ====================================
    // ESTILOS CSS
    // ====================================

    function addV15Styles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* PWA Install Button */
            .pwa-install-button {
                position: fixed;
                bottom: 80px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                border: none;
                border-radius: 16px;
                padding: 15px 20px;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                cursor: pointer;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s;
                animation: slideInRight 0.5s;
            }

            .pwa-install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(16, 185, 129, 0.5);
            }

            .pwa-install-button.minimized {
                padding: 12px;
                border-radius: 50%;
            }

            .pwa-install-button.minimized .install-text {
                display: none;
            }

            .install-icon {
                font-size: 24px;
            }

            .install-text strong {
                display: block;
                font-size: 14px;
            }

            .install-text small {
                font-size: 11px;
                opacity: 0.9;
            }

            /* Install Banner */
            .install-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                transform: translateY(100%);
                transition: transform 0.3s;
            }

            .install-banner.visible {
                transform: translateY(0);
            }

            .banner-content {
                display: flex;
                align-items: center;
                gap: 15px;
                max-width: 600px;
                margin: 0 auto;
            }

            .banner-icon {
                font-size: 32px;
            }

            .banner-text strong {
                display: block;
                font-size: 16px;
                margin-bottom: 5px;
            }

            .banner-text p {
                font-size: 13px;
                opacity: 0.9;
                margin: 0;
            }

            .banner-actions {
                display: flex;
                gap: 10px;
                margin-left: auto;
            }

            .btn-install,
            .btn-dismiss {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
            }

            .btn-install {
                background: white;
                color: #10b981;
            }

            .btn-dismiss {
                background: rgba(255, 255, 255, 0.2);
                color: white;
            }

            /* iOS Install Modal */
            .ios-install-modal .modal-content {
                max-width: 500px;
            }

            .ios-instructions {
                padding: 20px 0;
            }

            .ios-instructions ol {
                list-style: none;
                padding: 0;
            }

            .ios-instructions li {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .ios-instructions li:last-child {
                border-bottom: none;
            }

            .step-icon {
                background: #10b981;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
            }

            .step-text {
                flex: 1;
            }

            .ios-icon {
                display: inline-block;
                margin-left: 8px;
                font-size: 20px;
                vertical-align: middle;
            }

            .note {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px;
                margin-top: 20px;
                border-radius: 4px;
            }

            /* Connection Indicator */
            #connection-indicator {
                position: fixed;
                top: 70px;
                right: 20px;
                background: white;
                padding: 8px 12px;
                border-radius: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                z-index: 999;
            }

            #connection-indicator .indicator-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
            }

            #connection-indicator.offline .indicator-dot {
                background: #ef4444;
            }

            /* Sync Badge */
            .sync-badge {
                position: fixed;
                top: 60px;
                right: 15px;
                background: #f59e0b;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                z-index: 1000;
            }

            /* Sync Progress */
            .sync-progress {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px 30px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                gap: 15px;
                z-index: 10001;
            }

            .sync-spinner {
                width: 24px;
                height: 24px;
                border: 3px solid #e5e7eb;
                border-top-color: #10b981;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Sync Notification */
            .sync-notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(120%);
                transition: transform 0.3s;
                z-index: 10000;
                max-width: 300px;
            }

            .sync-notification.visible {
                transform: translateX(0);
            }

            .sync-notification.success {
                border-left: 4px solid #10b981;
            }

            .sync-notification.warning {
                border-left: 4px solid #f59e0b;
            }

            .sync-notification.error {
                border-left: 4px solid #ef4444;
            }

            /* V15 Notification */
            .v15-notification {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                transform: translateY(120%);
                transition: transform 0.3s;
                max-width: 400px;
                margin: 0 auto;
            }

            .v15-notification.visible {
                transform: translateY(0);
            }

            .v15-notification .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 15px;
            }

            .v15-notification .notification-icon {
                font-size: 32px;
            }

            .v15-notification .notification-text {
                flex: 1;
            }

            .v15-notification strong {
                display: block;
                font-size: 16px;
                margin-bottom: 5px;
            }

            .v15-notification p {
                font-size: 13px;
                margin: 5px 0 10px 0;
                opacity: 0.9;
            }

            .btn-install-notif {
                background: white;
                color: #10b981;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
            }

            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .pwa-install-button {
                    bottom: 20px;
                    right: 20px;
                }

                .banner-content {
                    flex-direction: column;
                    text-align: center;
                }

                .banner-actions {
                    margin-left: 0;
                    width: 100%;
                }

                .banner-actions button {
                    flex: 1;
                }
            }

            /* Standalone Mode */
            .standalone-mode .browser-only {
                display: none !important;
            }

            /* Gestures */
            .prevent-zoom {
                touch-action: manipulation;
            }
        `;

        document.head.appendChild(styles);
    }

    // ====================================
    // COMANDOS DE CONSOLA
    // ====================================

    window.v15 = {
        installPWA: () => {
            if (window.pwaMobile) {
                window.pwaMobile.installPWA();
            }
        },

        share: (data) => {
            if (window.pwaMobile) {
                window.pwaMobile.shareContent(data || {});
            }
        },

        deviceInfo: () => {
            if (window.pwaMobile) {
                const info = window.pwaMobile.getDeviceInfo();
                console.table(info);
                return info;
            }
        },

        syncStatus: () => {
            if (window.offlineSync) {
                const info = window.offlineSync.getConnectionInfo();
                console.table(info);
                return info;
            }
        },

        syncNow: () => {
            if (window.offlineSync) {
                window.offlineSync.syncAll();
            }
        },

        vibrate: (pattern) => {
            if (window.pwaMobile) {
                window.pwaMobile.vibrate(pattern || 200);
            }
        },

        help: () => {
            console.log('%c=== Nivel 15 - Comandos Disponibles ===', 'color: #10b981; font-weight: bold; font-size: 16px;');
            console.log('v15.installPWA()      - Instalar PWA');
            console.log('v15.share(data)       - Compartir contenido');
            console.log('v15.deviceInfo()      - Info del dispositivo');
            console.log('v15.syncStatus()      - Estado de sincronización');
            console.log('v15.syncNow()         - Sincronizar ahora');
            console.log('v15.vibrate(pattern)  - Vibrar dispositivo');
            console.log('v15.help()            - Mostrar esta ayuda');
        }
    };

    // ====================================
    // INICIAR TODO
    // ====================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initV15);
    } else {
        initV15();
    }

})();
