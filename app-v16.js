/**
 * Integración Nivel 16 Ultimate v16.0
 * Inventario Inteligente + Búsqueda IA + WhatsApp + Testing + ML
 *
 * Nuevas Funcionalidades v16:
 * - Sistema de Inventario Inteligente
 * - Búsqueda Avanzada con IA
 * - WhatsApp Business Integration
 * - Testing Setup Guide
 * - ML con TensorFlow.js
 */

(function() {
    'use strict';

    console.log('%c✨ Nivel 16 Ultimate Cargado', 'background: #8b5cf6; color: white; padding: 8px; font-weight: bold; font-size: 14px;');

    // ====================================
    // INICIALIZACIÓN
    // ====================================

    function initV16() {
        console.log('Inicializando Nivel 16...');

        setupInventoryNotifications();
        setupSearchEnhancements();
        setupWhatsAppIntegration();

        console.log('✅ Nivel 16 inicializado correctamente');

        setTimeout(() => {
            showV16Notification();
        }, 2000);
    }

    // ====================================
    // INVENTARIO
    // ====================================

    function setupInventoryNotifications() {
        if (!window.inventorySystem) return;

        // Verificar alertas cada 5 minutos
        setInterval(() => {
            const alerts = window.inventorySystem.checkStockLevels();
            if (alerts.length > 0) {
                console.log(`⚠️ ${alerts.length} alertas de inventario`);
            }
        }, 5 * 60 * 1000);
    }

    // ====================================
    // BÚSQUEDA AVANZADA
    // ====================================

    function setupSearchEnhancements() {
        // Mejorar el input de búsqueda existente
        const searchInput = document.getElementById('quick-search');
        if (searchInput && window.searchAI) {
            // Autocompletado
            searchInput.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value.length >= 2) {
                    const suggestions = window.searchAI.getAutocompleteSuggestions(value);
                    showSearchSuggestions(suggestions);
                }
            });
        }
    }

    function showSearchSuggestions(suggestions) {
        let container = document.getElementById('search-suggestions');

        if (!container) {
            container = document.createElement('div');
            container.id = 'search-suggestions';
            container.className = 'search-suggestions';
            document.getElementById('search-bar')?.appendChild(container);
        }

        if (suggestions.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = suggestions.map(sugg => `
            <div class="suggestion-item" onclick="window.searchAI.searchAdvanced('${sugg.text}')">
                <span class="sugg-icon">${sugg.type === 'history' ? '🕐' : '🔥'}</span>
                <span class="sugg-text">${sugg.text}</span>
            </div>
        `).join('');

        container.style.display = 'block';
    }

    // ====================================
    // WHATSAPP
    // ====================================

    function setupWhatsAppIntegration() {
        // El botón flotante ya se agregó automáticamente

        // Agregar botón compartir en productos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('share-whatsapp')) {
                const productData = e.target.dataset.product;
                if (productData && window.whatsappBusiness) {
                    const product = JSON.parse(productData);
                    window.whatsappBusiness.shareProduct(product);
                }
            }
        });
    }

    // ====================================
    // NOTIFICACIÓN V16
    // ====================================

    function showV16Notification() {
        const notification = document.createElement('div');
        notification.className = 'v16-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🚀</div>
                <div class="notification-text">
                    <strong>¡Nivel 16 Ultimate Activado!</strong>
                    <p>Inventario Inteligente + Búsqueda IA + WhatsApp + ML</p>
                    <div class="notification-features">
                        <span>📦 Inventario Inteligente</span>
                        <span>🔍 Búsqueda IA</span>
                        <span>💬 WhatsApp Business</span>
                    </div>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('visible');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    // ====================================
    // ESTILOS CSS
    // ====================================

    function addV16Styles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* WhatsApp Float Button */
            .whatsapp-float-btn {
                position: fixed;
                bottom: 80px;
                left: 20px;
                background: #25d366;
                color: white;
                padding: 12px 20px;
                border-radius: 50px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                text-decoration: none;
                font-weight: bold;
                z-index: 1000;
                transition: all 0.3s;
            }

            .whatsapp-float-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
            }

            .whatsapp-float-btn svg {
                width: 24px;
                height: 24px;
            }

            /* Inventory Badge */
            .inventory-badge {
                position: fixed;
                top: 70px;
                left: 20px;
                background: #f59e0b;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                z-index: 999;
                animation: pulse 2s infinite;
            }

            .inventory-badge.critical {
                background: #ef4444;
            }

            .inventory-badge.warning {
                background: #f59e0b;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            /* Search Suggestions */
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                max-height: 300px;
                overflow-y: auto;
                z-index: 100;
            }

            .suggestion-item {
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .suggestion-item:hover {
                background: #f3f4f6;
            }

            .sugg-icon {
                font-size: 16px;
            }

            /* V16 Notification */
            .v16-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.3s;
                max-width: 400px;
            }

            .v16-notification.visible {
                transform: translateX(0);
            }

            .notification-features {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .notification-features span {
                background: rgba(255, 255, 255, 0.2);
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }

            /* Inventory Dashboard */
            .inventory-dashboard {
                background: #1a1a2e;
                color: #fff;
            }

            .inventory-tabs {
                display: flex;
                gap: 10px;
                padding: 20px;
                border-bottom: 1px solid #2a2a4a;
                overflow-x: auto;
            }

            .inv-tab {
                background: none;
                border: none;
                color: #a0a0c0;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
            }

            .inv-tab:hover {
                background: rgba(139, 92, 246, 0.1);
                color: #fff;
            }

            .inv-tab.active {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                color: #fff;
            }

            .inv-tab-content {
                display: none;
                padding: 20px;
            }

            .inv-tab-content.active {
                display: block;
            }

            /* Mobile Optimizations */
            @media (max-width: 768px) {
                .whatsapp-float-btn {
                    bottom: 70px;
                    left: 10px;
                    padding: 10px 16px;
                    font-size: 14px;
                }

                .whatsapp-float-btn span {
                    display: none;
                }

                .inventory-badge {
                    top: 60px;
                    left: 10px;
                }

                .v16-notification {
                    top: 60px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    // ====================================
    // COMANDOS DE CONSOLA
    // ====================================

    window.v16 = {
        inventory: () => {
            if (window.inventorySystem) {
                window.inventorySystem.openInventoryDashboard();
            }
        },

        search: (query) => {
            if (window.searchAI) {
                return window.searchAI.searchAdvanced(query);
            }
        },

        whatsapp: () => {
            if (window.whatsappBusiness) {
                window.whatsappBusiness.contactSupport();
            }
        },

        ml: {
            recommendations: async (userId = 'user1') => {
                if (window.mlTensorFlow) {
                    return await window.mlTensorFlow.getPersonalizedRecommendations(userId);
                }
            }
        },

        help: () => {
            console.log('%c=== Nivel 16 - Comandos Disponibles ===', 'color: #8b5cf6; font-weight: bold; font-size: 16px;');
            console.log('v16.inventory()                 - Abrir dashboard de inventario');
            console.log('v16.search(query)               - Búsqueda avanzada');
            console.log('v16.whatsapp()                  - Contactar por WhatsApp');
            console.log('v16.ml.recommendations(userId)  - Recomendaciones ML');
            console.log('v16.help()                      - Mostrar esta ayuda');
        }
    };

    // ====================================
    // INICIAR TODO
    // ====================================

    function startV16() {
        addV16Styles();
        initV16();

        console.log('%c💡 Tip: Escribe v16.help() para ver comandos', 'color: #8b5cf6; font-size: 12px;');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startV16);
    } else {
        startV16();
    }

})();
