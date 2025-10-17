/**
 * Integración Nivel 14 Enterprise v14.0
 * Admin Panel Advanced + AI Conversational Advanced
 *
 * Nuevas Funcionalidades v14:
 * - Panel de administración completo con UI visual
 * - Gestión de base de datos (CRUD visual)
 * - Entrenamiento del bot con interfaz intuitiva
 * - IA conversacional avanzada con NLP
 * - Análisis de sentimientos en tiempo real
 * - Context awareness y multi-turn conversations
 * - Personalización por usuario
 * - Backup/Restore completo
 * - Logs del sistema
 * - Configuración visual del sistema
 */

(function() {
    'use strict';

    console.log('%c✨ Nivel 14 Enterprise Cargado', 'background: #667eea; color: white; padding: 8px; font-weight: bold; font-size: 14px;');
    console.log('%cPanel de Administración Avanzado v14.0', 'color: #667eea; font-weight: bold;');
    console.log('%cIA Conversacional Avanzada v14.0', 'color: #667eea; font-weight: bold;');

    // ====================================
    // VARIABLES GLOBALES
    // ====================================

    let adminPanel = null;
    let aiConversational = null;
    let adminButtonAdded = false;

    // ====================================
    // INICIALIZACIÓN
    // ====================================

    function initV14() {
        console.log('Inicializando Nivel 14...');

        // Verificar que las dependencias estén cargadas
        if (typeof AdminPanelAdvanced === 'undefined') {
            console.error('AdminPanelAdvanced no está cargado');
            return;
        }

        if (typeof AIConversationalAdvanced === 'undefined') {
            console.error('AIConversationalAdvanced no está cargado');
            return;
        }

        // Inicializar sistemas
        adminPanel = new AdminPanelAdvanced();
        aiConversational = new AIConversationalAdvanced();

        // Exponer globalmente
        window.adminPanelAdvanced = adminPanel;
        window.aiConversational = aiConversational;

        // Setup UI
        addAdminButton();
        setupAIIntegration();
        setupQuickAccess();

        console.log('✅ Nivel 14 inicializado correctamente');

        // Notificación al usuario
        setTimeout(() => {
            showV14Notification();
        }, 2000);
    }

    // ====================================
    // BOTÓN DE ADMINISTRACIÓN
    // ====================================

    function addAdminButton() {
        if (adminButtonAdded) return;

        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) {
            console.warn('header-actions no encontrado, reintentando...');
            setTimeout(addAdminButton, 500);
            return;
        }

        // Crear botón de admin
        const adminBtn = document.createElement('button');
        adminBtn.id = 'admin-panel-btn';
        adminBtn.className = 'header-btn';
        adminBtn.title = 'Panel de Administración v14';
        adminBtn.innerHTML = '🔧';
        adminBtn.onclick = openAdminPanel;

        // Insertar antes del botón de usuario
        const userMenuContainer = document.querySelector('.user-menu-container');
        if (userMenuContainer) {
            headerActions.insertBefore(adminBtn, userMenuContainer);
        } else {
            headerActions.appendChild(adminBtn);
        }

        adminButtonAdded = true;
        console.log('✅ Botón de administración agregado');
    }

    function openAdminPanel() {
        if (adminPanel) {
            adminPanel.openAdminPanel();
        }
    }

    // ====================================
    // INTEGRACIÓN CON IA
    // ====================================

    function setupAIIntegration() {
        // DESHABILITADO: La interceptación causa conflictos
        // El sistema de IA conversacional está disponible pero no interfiere
        // con el flujo normal del chatbot

        console.log('✅ IA Conversacional disponible (v14.testAI para probar)');

        // La IA puede ser usada directamente con v14.testAI(message) en consola
        // sin interceptar el flujo normal del chatbot
    }

    function showEscalationAlert() {
        // Mostrar notificación de que el caso requiere atención especial
        const alert = document.createElement('div');
        alert.className = 'escalation-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <span class="alert-icon">⚠️</span>
                <div class="alert-text">
                    <strong>Caso requiere atención especial</strong>
                    <p>Este mensaje ha sido marcado para revisión por un administrador.</p>
                </div>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(alert);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // ====================================
    // ACCESO RÁPIDO
    // ====================================

    function setupQuickAccess() {
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + A = Abrir Admin Panel
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                openAdminPanel();
            }

            // Ctrl/Cmd + Shift + D = Dashboard
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                openAdminPanel();
                setTimeout(() => {
                    if (adminPanel) adminPanel.switchTab('dashboard');
                }, 100);
            }

            // Ctrl/Cmd + Shift + T = Training
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                openAdminPanel();
                setTimeout(() => {
                    if (adminPanel) adminPanel.switchTab('training');
                }, 100);
            }

            // Ctrl/Cmd + Shift + B = Backup
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                if (adminPanel) {
                    adminPanel.quickBackup();
                }
            }
        });

        console.log('✅ Atajos de teclado configurados');
        console.log('   Ctrl+Shift+A: Abrir Panel de Administración');
        console.log('   Ctrl+Shift+D: Dashboard');
        console.log('   Ctrl+Shift+T: Entrenar Bot');
        console.log('   Ctrl+Shift+B: Backup Rápido');
    }

    // ====================================
    // NOTIFICACIONES
    // ====================================

    function showV14Notification() {
        const notification = document.createElement('div');
        notification.className = 'v14-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🚀</div>
                <div class="notification-text">
                    <strong>¡Nivel 14 Enterprise Activado!</strong>
                    <p>Panel de Administración + IA Conversacional Avanzada</p>
                    <p class="notification-hint">Presiona <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> o click en 🔧</p>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 8000);
    }

    // ====================================
    // FUNCIONES DE UTILIDAD
    // ====================================

    function getV14Stats() {
        return {
            version: '14.0',
            features: [
                'Admin Panel Avanzado',
                'Gestión de BD Visual',
                'Entrenamiento del Bot',
                'IA Conversacional Avanzada',
                'NLP y Sentimientos',
                'Context Awareness',
                'Multi-turn Conversations',
                'Backup/Restore',
                'Logs del Sistema',
                'Configuración Visual'
            ],
            totalLines: 1200
        };
    }

    // ====================================
    // COMANDOS DE CONSOLA
    // ====================================

    window.v14 = {
        openAdmin: () => {
            openAdminPanel();
        },

        openTraining: () => {
            openAdminPanel();
            setTimeout(() => {
                if (adminPanel) adminPanel.switchTab('training');
            }, 100);
        },

        openDatabase: () => {
            openAdminPanel();
            setTimeout(() => {
                if (adminPanel) adminPanel.switchTab('database');
            }, 100);
        },

        backup: () => {
            if (adminPanel) {
                adminPanel.quickBackup();
            }
        },

        testAI: async (message) => {
            if (!message) {
                console.log('Uso: v14.testAI("tu mensaje aquí")');
                return;
            }

            const response = await aiConversational.processMessage(message);
            console.log('🤖 Bot:', response.text);
            console.log('Intent:', response.intent);
            console.log('Entities:', response.entities);
            console.log('Sentiment:', response.sentiment);
            return response;
        },

        metrics: () => {
            if (aiConversational) {
                const metrics = aiConversational.getConversationMetrics();
                console.table(metrics);
                return metrics;
            }
        },

        stats: () => {
            const stats = getV14Stats();
            console.log('%c=== Nivel 14 Enterprise Stats ===', 'color: #667eea; font-weight: bold; font-size: 16px;');
            console.log('Versión:', stats.version);
            console.log('Características:');
            stats.features.forEach(f => console.log('  ✓', f));
            console.log('Total líneas de código:', stats.totalLines);
            return stats;
        },

        help: () => {
            console.log('%c=== Nivel 14 - Comandos Disponibles ===', 'color: #667eea; font-weight: bold; font-size: 16px;');
            console.log('v14.openAdmin()        - Abrir panel de administración');
            console.log('v14.openTraining()     - Abrir entrenamiento del bot');
            console.log('v14.openDatabase()     - Abrir gestión de BD');
            console.log('v14.backup()           - Crear backup rápido');
            console.log('v14.testAI(message)    - Probar IA con un mensaje');
            console.log('v14.metrics()          - Ver métricas de conversación');
            console.log('v14.stats()            - Ver estadísticas del nivel 14');
            console.log('v14.help()             - Mostrar esta ayuda');
            console.log('\n%cAtajos de Teclado:', 'font-weight: bold;');
            console.log('Ctrl+Shift+A - Abrir Admin Panel');
            console.log('Ctrl+Shift+D - Dashboard');
            console.log('Ctrl+Shift+T - Training');
            console.log('Ctrl+Shift+B - Backup');
        }
    };

    // ====================================
    // ESTILOS CSS
    // ====================================

    function addV14Styles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Admin Panel Button */
            #admin-panel-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                animation: pulse-admin 2s infinite;
            }

            @keyframes pulse-admin {
                0%, 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(102, 126, 234, 0); }
            }

            /* Modal Fullscreen */
            .modal-fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .modal-fullscreen .modal-content {
                width: 95%;
                height: 95%;
                max-width: none;
                max-height: none;
                display: flex;
                flex-direction: column;
            }

            /* Admin Panel */
            .admin-panel-content {
                background: #1a1a2e;
                color: #fff;
            }

            .admin-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                border-radius: 12px 12px 0 0;
            }

            .admin-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }

            .admin-sidebar {
                width: 250px;
                background: #16213e;
                border-right: 1px solid #2a2a4a;
                overflow-y: auto;
            }

            .admin-nav {
                padding: 20px 0;
            }

            .admin-nav-item {
                width: 100%;
                padding: 15px 20px;
                background: none;
                border: none;
                color: #a0a0c0;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 15px;
                transition: all 0.3s;
                text-align: left;
            }

            .admin-nav-item:hover {
                background: rgba(102, 126, 234, 0.1);
                color: #fff;
            }

            .admin-nav-item.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                font-weight: bold;
            }

            .nav-icon {
                font-size: 20px;
            }

            .admin-content {
                flex: 1;
                padding: 30px;
                overflow-y: auto;
                background: #0f172a;
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }

            .stat-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 25px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 15px;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }

            .stat-icon {
                font-size: 40px;
            }

            .stat-value {
                font-size: 32px;
                font-weight: bold;
                color: #fff;
            }

            .stat-label {
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
            }

            /* Buttons */
            .btn-admin {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 15px;
                transition: transform 0.2s;
                margin: 5px;
            }

            .btn-admin:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .btn-sm {
                padding: 8px 16px;
                font-size: 13px;
            }

            .btn-icon {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                padding: 5px 10px;
                transition: transform 0.2s;
            }

            .btn-icon:hover {
                transform: scale(1.2);
            }

            /* Tables */
            .data-table {
                width: 100%;
                border-collapse: collapse;
                background: #1a1a2e;
                border-radius: 8px;
                overflow: hidden;
            }

            .data-table th {
                background: #667eea;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }

            .data-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #2a2a4a;
            }

            .data-table tr:hover {
                background: rgba(102, 126, 234, 0.1);
            }

            /* Training Items */
            .training-item {
                background: #1a1a2e;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 15px;
                border-left: 4px solid #667eea;
            }

            .training-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .training-category {
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }

            .badge-greeting { background: #10b981; color: white; }
            .badge-product { background: #3b82f6; color: white; }
            .badge-price { background: #f59e0b; color: white; }
            .badge-shipping { background: #8b5cf6; color: white; }
            .badge-payment { background: #ec4899; color: white; }
            .badge-other { background: #6b7280; color: white; }

            /* Notifications */
            .v14-notification {
                position: fixed;
                top: 80px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
                z-index: 10001;
                animation: slideInRight 0.5s;
                max-width: 400px;
                transition: opacity 0.3s;
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .notification-content {
                display: flex;
                gap: 15px;
                align-items: flex-start;
            }

            .notification-icon {
                font-size: 32px;
            }

            .notification-text strong {
                display: block;
                font-size: 16px;
                margin-bottom: 5px;
            }

            .notification-text p {
                margin: 5px 0;
                font-size: 14px;
            }

            .notification-hint {
                font-size: 12px !important;
                opacity: 0.9;
            }

            .notification-hint kbd {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
            }

            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
            }

            /* Escalation Alert */
            .escalation-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
                z-index: 10001;
                animation: slideInRight 0.3s;
            }

            .alert-content {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .alert-icon {
                font-size: 24px;
            }

            .alert-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
            }
        `;

        document.head.appendChild(styles);
    }

    // ====================================
    // INICIAR TODO
    // ====================================

    function startV14() {
        addV14Styles();
        initV14();

        // Mostrar comandos disponibles en consola
        console.log('%c💡 Tip: Escribe v14.help() en la consola para ver todos los comandos', 'color: #10b981; font-size: 12px;');
    }

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startV14);
    } else {
        startV14();
    }

})();
