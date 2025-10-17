/**
 * Sistema PWA Mobile Enhanced v15.0
 * PWA mejorado para instalación en dispositivos móviles
 *
 * Características:
 * - Instalación completa como app nativa
 * - Detección automática de móvil
 * - Splash screen personalizado
 * - Orientación adaptativa
 * - Gestos táctiles avanzados
 * - Optimización de rendimiento móvil
 * - Compartir nativo
 * - Notificaciones push móvil
 * - App shortcuts
 * - Modo standalone completo
 */

class PWAMobileEnhanced {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isMobile = this.detectMobile();
        this.isStandalone = this.isRunningStandalone();
        this.installPromptShown = localStorage.getItem('installPromptShown') === 'true';
        this.init();
    }

    init() {
        console.log('PWA Mobile Enhanced v15.0 inicializado');

        this.setupInstallPrompt();
        this.setupGestures();
        this.optimizeForMobile();
        this.setupShareAPI();
        this.checkInstallation();

        if (this.isMobile && !this.isStandalone && !this.installPromptShown) {
            setTimeout(() => this.showInstallBanner(), 3000);
        }
    }

    // ====================================
    // DETECCIÓN DE DISPOSITIVO
    // ====================================

    detectMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Detectar Android
        if (/android/i.test(userAgent)) {
            return 'android';
        }

        // Detectar iOS
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'ios';
        }

        // Detectar Windows Phone
        if (/windows phone/i.test(userAgent)) {
            return 'windows';
        }

        // Mobile genérico
        if (/mobile/i.test(userAgent)) {
            return 'mobile';
        }

        return false;
    }

    isRunningStandalone() {
        // PWA instalada en Android/Desktop
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }

        // PWA instalada en iOS
        if (window.navigator.standalone === true) {
            return true;
        }

        return false;
    }

    // ====================================
    // INSTALACIÓN DE PWA
    // ====================================

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('PWA instalable detectada');

            // Mostrar botón de instalación si es móvil
            if (this.isMobile) {
                this.showInstallButton();
            }
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA instalada exitosamente');
            this.isInstalled = true;
            this.hideInstallUI();
            this.showInstalledMessage();
        });
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            // En iOS, mostrar instrucciones manuales
            if (this.isMobile === 'ios') {
                this.showIOSInstallInstructions();
                return;
            }

            alert('La aplicación ya está instalada o tu navegador no soporta instalación.');
            return;
        }

        this.deferredPrompt.prompt();

        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar PWA');
            this.log('PWA instalada', 'success');
        } else {
            console.log('Usuario rechazó instalar PWA');
        }

        this.deferredPrompt = null;
    }

    showInstallButton() {
        // Crear botón flotante de instalación
        if (document.getElementById('pwa-install-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'pwa-install-btn';
        btn.className = 'pwa-install-button';
        btn.innerHTML = `
            <div class="install-icon">📱</div>
            <div class="install-text">
                <strong>Instalar App</strong>
                <small>Úsala como app nativa</small>
            </div>
        `;

        btn.onclick = () => this.installPWA();

        document.body.appendChild(btn);

        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            btn.classList.add('minimized');
        }, 10000);
    }

    showInstallBanner() {
        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">📱</div>
                <div class="banner-text">
                    <strong>¡Instala la App!</strong>
                    <p>Accede más rápido y úsala sin conexión</p>
                </div>
                <div class="banner-actions">
                    <button class="btn-install" onclick="window.pwaMobile.installPWA()">Instalar</button>
                    <button class="btn-dismiss" onclick="window.pwaMobile.dismissBanner()">Ahora no</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Animar entrada
        setTimeout(() => {
            banner.classList.add('visible');
        }, 100);
    }

    dismissBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('visible');
            setTimeout(() => banner.remove(), 300);
        }

        localStorage.setItem('installPromptShown', 'true');
        this.installPromptShown = true;
    }

    showIOSInstallInstructions() {
        const modal = document.createElement('div');
        modal.className = 'modal ios-install-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📱 Instalar en iOS</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body ios-instructions">
                    <p>Para instalar la app en tu iPhone/iPad:</p>
                    <ol>
                        <li>
                            <div class="step-icon">1</div>
                            <div class="step-text">
                                Toca el botón <strong>Compartir</strong>
                                <span class="ios-icon">⎙</span>
                                en la barra inferior de Safari
                            </div>
                        </li>
                        <li>
                            <div class="step-icon">2</div>
                            <div class="step-text">
                                Desliza hacia abajo y toca
                                <strong>"Agregar a pantalla de inicio"</strong>
                                <span class="ios-icon">⊕</span>
                            </div>
                        </li>
                        <li>
                            <div class="step-icon">3</div>
                            <div class="step-text">
                                Toca <strong>"Agregar"</strong> en la esquina superior derecha
                            </div>
                        </li>
                        <li>
                            <div class="step-icon">4</div>
                            <div class="step-text">
                                ¡Listo! Encuentra el ícono en tu pantalla de inicio
                            </div>
                        </li>
                    </ol>
                    <div class="note">
                        <strong>Nota:</strong> Debes usar Safari para instalar. Chrome y otros navegadores no soportan instalación en iOS.
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.appendChild(modal);
    }

    hideInstallUI() {
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.remove();

        const banner = document.getElementById('install-banner');
        if (banner) banner.remove();
    }

    showInstalledMessage() {
        const message = document.createElement('div');
        message.className = 'installed-message';
        message.innerHTML = `
            <div class="message-content">
                <div class="message-icon">✅</div>
                <div class="message-text">
                    <strong>¡App Instalada!</strong>
                    <p>Ya puedes usarla desde tu pantalla de inicio</p>
                </div>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.add('visible');
        }, 100);

        setTimeout(() => {
            message.classList.remove('visible');
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }

    checkInstallation() {
        if (this.isStandalone) {
            console.log('App ejecutándose en modo standalone');
            this.isInstalled = true;
            this.applyStandaloneStyles();
        }
    }

    applyStandaloneStyles() {
        document.body.classList.add('standalone-mode');

        // Ocultar elementos no necesarios en modo app
        const elementsToHide = document.querySelectorAll('.browser-only');
        elementsToHide.forEach(el => el.style.display = 'none');
    }

    // ====================================
    // GESTOS TÁCTILES
    // ====================================

    setupGestures() {
        if (!this.isMobile) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        }, { passive: true });

        // Prevenir zoom con doble tap en algunos elementos
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.prevent-zoom')) {
                e.preventDefault();
            }
        });
    }

    handleGesture(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;
        const absX = Math.abs(diffX);
        const absY = Math.abs(diffY);

        // Swipe horizontal
        if (absX > absY && absX > 50) {
            if (diffX > 0) {
                this.onSwipeRight();
            } else {
                this.onSwipeLeft();
            }
        }

        // Swipe vertical
        if (absY > absX && absY > 50) {
            if (diffY > 0) {
                this.onSwipeDown();
            } else {
                this.onSwipeUp();
            }
        }
    }

    onSwipeRight() {
        console.log('Swipe right detected');
        // Podrías cerrar modales, ir atrás, etc.
    }

    onSwipeLeft() {
        console.log('Swipe left detected');
    }

    onSwipeDown() {
        console.log('Swipe down detected');
        // Podrías refrescar contenido
    }

    onSwipeUp() {
        console.log('Swipe up detected');
    }

    // ====================================
    // OPTIMIZACIONES MÓVILES
    // ====================================

    optimizeForMobile() {
        if (!this.isMobile) return;

        // Desactivar selección de texto en elementos interactivos
        const style = document.createElement('style');
        style.textContent = `
            button, .btn, .header-btn, .modal-close {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }

            /* Mejoras táctiles */
            button, a, .clickable {
                cursor: pointer;
                -webkit-tap-highlight-color: rgba(102, 126, 234, 0.3);
            }

            /* Prevenir pull-to-refresh en áreas específicas */
            .chat-messages {
                overscroll-behavior-y: contain;
            }

            /* Smooth scrolling */
            * {
                -webkit-overflow-scrolling: touch;
            }
        `;
        document.head.appendChild(style);

        // Detectar orientación
        this.handleOrientation();
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleOrientation(), 200);
        });

        // Prevenir zoom accidental
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    }

    handleOrientation() {
        const orientation = screen.orientation?.type ||
                          (window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');

        document.body.classList.remove('portrait', 'landscape');

        if (orientation.includes('portrait')) {
            document.body.classList.add('portrait');
        } else {
            document.body.classList.add('landscape');
        }

        console.log('Orientación:', orientation);
    }

    // ====================================
    // WEB SHARE API
    // ====================================

    setupShareAPI() {
        // Agregar botón de compartir si el API está disponible
        if (navigator.share && this.isMobile) {
            this.addShareButton();
        }
    }

    addShareButton() {
        // El botón se agregará en contextos específicos (productos, etc.)
    }

    async shareContent(data) {
        if (!navigator.share) {
            // Fallback: copiar link al clipboard
            this.copyToClipboard(data.url || window.location.href);
            return;
        }

        try {
            await navigator.share({
                title: data.title || 'Repuestos Motos',
                text: data.text || 'Mira esta app de repuestos de motos',
                url: data.url || window.location.href
            });

            console.log('Contenido compartido exitosamente');
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error al compartir:', err);
            }
        }
    }

    async shareProduct(product) {
        await this.shareContent({
            title: product.name,
            text: `${product.name} - $${product.price}\n${product.description}`,
            url: window.location.href + '#product-' + product.id
        });
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Link copiado al portapapeles');
            });
        } else {
            // Fallback para navegadores viejos
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            alert('Link copiado al portapapeles');
        }
    }

    // ====================================
    // APP SHORTCUTS (ANDROID)
    // ====================================

    setupAppShortcuts() {
        // Los shortcuts se definen en manifest.json
        // Aquí manejamos las acciones cuando se activan

        window.addEventListener('DOMContentLoaded', () => {
            const params = new URLSearchParams(window.location.search);
            const action = params.get('action');

            if (action) {
                this.handleShortcutAction(action);
            }
        });
    }

    handleShortcutAction(action) {
        switch(action) {
            case 'search':
                // Abrir búsqueda
                document.getElementById('search-btn')?.click();
                break;
            case 'cart':
                // Abrir carrito
                document.getElementById('cart-btn')?.click();
                break;
            case 'admin':
                // Abrir panel admin
                if (window.v14) {
                    window.v14.openAdmin();
                }
                break;
        }
    }

    // ====================================
    // NOTIFICACIONES PUSH MÓVIL
    // ====================================

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Notificaciones no soportadas');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    async showNotification(title, options = {}) {
        const hasPermission = await this.requestNotificationPermission();

        if (!hasPermission) {
            console.log('Permiso de notificaciones denegado');
            return;
        }

        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'repuestos-motos',
            requireInteraction: false
        };

        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    ...defaultOptions,
                    ...options
                });
            });
        } else {
            new Notification(title, {
                ...defaultOptions,
                ...options
            });
        }
    }

    // ====================================
    // MODO KIOSK / FULLSCREEN
    // ====================================

    async enterFullscreen() {
        const elem = document.documentElement;

        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
        }
    }

    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // ====================================
    // VIBRACIÓN (HAPTIC FEEDBACK)
    // ====================================

    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    vibrateClick() {
        this.vibrate(10);
    }

    vibrateSuccess() {
        this.vibrate([100, 50, 100]);
    }

    vibrateError() {
        this.vibrate([200, 100, 200, 100, 200]);
    }

    // ====================================
    // UTILIDADES
    // ====================================

    log(message, type = 'info') {
        console.log(`[PWA Mobile] ${message}`);
    }

    getDeviceInfo() {
        return {
            isMobile: this.isMobile,
            isStandalone: this.isStandalone,
            isInstalled: this.isInstalled,
            platform: this.isMobile || 'desktop',
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.screen.width,
                height: window.screen.height
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            orientation: screen.orientation?.type || 'unknown',
            connectionType: navigator.connection?.effectiveType || 'unknown',
            online: navigator.onLine
        };
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.pwaMobile = new PWAMobileEnhanced();
}
