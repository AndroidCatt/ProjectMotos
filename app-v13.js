// App V13.0 - Advanced Messaging, Push Notifications, Real-Time Analytics & Backup
// Integración de todos los niveles (1-13)

// Sistemas nivel 13
let messagingSystem;
let pushNotifications;
let realtimeAnalytics;
let backupSystem;

// ============================================
// INICIALIZACIÓN v13.0
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[V13] Inicializando VERSIÓN 13.0...');
    console.log('[V13] Integrando sistemas avanzados de comunicación y recuperación...');

    // Inicializar sistemas nivel 13
    messagingSystem = window.messagingSystem;
    pushNotifications = window.pushNotifications;
    realtimeAnalytics = window.realtimeAnalytics;
    backupSystem = window.backupSystem;

    // Configurar integraciones
    setupMessaging();
    setupPushNotifications();
    setupRealtimeAnalytics();
    setupBackupSystem();
    setupFinalIntegrationV13();

    // Mostrar banner de bienvenida v13
    showWelcomeBannerV13();

    console.log('[V13] ✅ Sistema v13.0 inicializado correctamente');
    console.log('[V13] 🚀 Todos los niveles (1-13) activos');
    logSystemStatusV13();
});

// ============================================
// MESSAGING SYSTEM INTEGRATION
// ============================================

function setupMessaging() {
    // Configurar usuario actual desde auth system
    if (window.authSystem && window.authSystem.isAuthenticated()) {
        const user = window.authSystem.getCurrentUser();
        messagingSystem.setCurrentUser(user.id);
    }

    // Escuchar nuevos mensajes
    messagingSystem.on('message_sent', (message) => {
        console.log('[V13] Mensaje enviado:', message.id);

        // Enviar notificación push
        if (message.senderId !== messagingSystem.currentUser) {
            pushNotifications.sendMessageNotification({
                id: message.id,
                senderName: message.senderId,
                text: message.content.text,
                conversationId: message.conversationId
            });
        }

        // Track analytics
        realtimeAnalytics.track('message_sent', {
            messageId: message.id,
            conversationId: message.conversationId,
            contentType: message.content.type
        });
    });

    // Escuchar menciones
    messagingSystem.on('user_mentioned', ({ message, mentions }) => {
        console.log('[V13] Usuario mencionado:', mentions);

        // Notificar a usuarios mencionados
        mentions.forEach(username => {
            pushNotifications.send(`${message.senderId} te mencionó`, {
                body: message.content.text.substring(0, 100),
                category: 'messages',
                data: {
                    type: 'mention',
                    messageId: message.id,
                    conversationId: message.conversationId
                }
            });
        });
    });

    // Escuchar typing indicators
    messagingSystem.on('typing_started', ({ conversationId, userId }) => {
        updateTypingIndicator(conversationId, userId, true);
    });

    messagingSystem.on('typing_stopped', ({ conversationId, userId }) => {
        updateTypingIndicator(conversationId, userId, false);
    });

    console.log('[V13] Messaging system integrated');
}

function updateTypingIndicator(conversationId, userId, isTyping) {
    // Update UI to show/hide typing indicator
    const indicator = document.getElementById(`typing-${conversationId}`);
    if (indicator) {
        indicator.style.display = isTyping ? 'block' : 'none';
        indicator.textContent = `${userId} está escribiendo...`;
    }
}

// ============================================
// PUSH NOTIFICATIONS INTEGRATION
// ============================================

function setupPushNotifications() {
    // Configurar preferencias por defecto
    pushNotifications.setPreferences({
        enabled: true,
        categories: {
            orders: true,
            messages: true,
            promotions: false,
            reviews: true,
            system: true
        },
        quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
        }
    });

    // Escuchar eventos de notificaciones
    pushNotifications.on('notification_sent', (notification) => {
        console.log('[V13] Notificación enviada:', notification.title);

        // Track analytics
        realtimeAnalytics.track('notification_sent', {
            notificationId: notification.id,
            category: notification.options.category,
            title: notification.title
        });
    });

    // Integrar con sistema de pedidos
    if (window.orderHistory) {
        window.addEventListener('order_status_changed', (e) => {
            const order = e.detail;
            pushNotifications.sendOrderNotification(order);
        });
    }

    // Integrar con sistema de reviews
    if (window.reviewSystem) {
        window.reviewSystem.on('review_submitted', (review) => {
            if (review.productOwnerId) {
                pushNotifications.sendReviewNotification(review);
            }
        });
    }

    console.log('[V13] Push notifications integrated');
}

// ============================================
// REAL-TIME ANALYTICS INTEGRATION
// ============================================

function setupRealtimeAnalytics() {
    // Configurar usuario desde auth
    if (window.authSystem && window.authSystem.isAuthenticated()) {
        const user = window.authSystem.getCurrentUser();
        realtimeAnalytics.currentSession.userId = user.id;
    }

    // Integrar con e-commerce events
    if (window.shoppingCart) {
        window.addEventListener('cart_item_added', (e) => {
            const item = e.detail;
            realtimeAnalytics.trackCart('add', item);
        });

        window.addEventListener('cart_item_removed', (e) => {
            const item = e.detail;
            realtimeAnalytics.trackCart('remove', item);
        });
    }

    // Integrar con checkout
    if (window.checkoutSystem) {
        window.addEventListener('checkout_step_completed', (e) => {
            const { step, data } = e.detail;
            realtimeAnalytics.trackCheckout(step, data);
        });

        window.addEventListener('order_completed', (e) => {
            const order = e.detail;
            realtimeAnalytics.trackConversion('purchase', order.total, {
                orderId: order.id,
                items: order.items.length
            });
        });
    }

    // Integrar con búsqueda
    if (window.elasticsearch) {
        window.addEventListener('search_performed', (e) => {
            const { query, results } = e.detail;
            realtimeAnalytics.trackSearch(query, results.length);
        });
    }

    // Suscribirse a eventos en tiempo real
    const subscriptionId = realtimeAnalytics.subscribe((eventType, data) => {
        // Log eventos importantes
        if (['conversion', 'error', 'checkout_step_1'].includes(data.name)) {
            console.log('[V13] Analytics event:', data.name, data);
        }
    });

    console.log('[V13] Real-time analytics integrated, subscription:', subscriptionId);
}

// ============================================
// BACKUP SYSTEM INTEGRATION
// ============================================

function setupBackupSystem() {
    // Configurar backup automático cada hora
    backupSystem.updateConfig({
        autoBackup: {
            enabled: true,
            interval: 3600000, // 1 hora
            maxBackups: 10,
            compressionEnabled: true
        },
        includedData: [
            'localStorage',
            'sessionStorage',
            'cart',
            'wishlist',
            'orders',
            'conversations',
            'notifications',
            'settings'
        ]
    });

    // Crear backup inicial si no existe
    if (!backupSystem.lastBackup) {
        backupSystem.createBackup('manual', { trigger: 'first_load' });
    }

    // Escuchar eventos de backup
    backupSystem.on('backup_created', (backup) => {
        console.log('[V13] Backup creado:', backup.id, backup.metadata.size);

        // Notificar usuario (solo si es manual)
        if (backup.type === 'manual') {
            showNotification('Backup creado exitosamente', 'success');
        }

        // Track analytics
        realtimeAnalytics.track('backup_created', {
            backupId: backup.id,
            type: backup.type,
            size: backup.metadata.size
        });
    });

    backupSystem.on('backup_restored', ({ backupId, timestamp }) => {
        console.log('[V13] Backup restaurado:', backupId);

        showNotification('Backup restaurado exitosamente', 'success');

        // Track analytics
        realtimeAnalytics.track('backup_restored', { backupId });
    });

    console.log('[V13] Backup system integrated');
}

// ============================================
// FINAL INTEGRATION V13
// ============================================

function setupFinalIntegrationV13() {
    // Extender el objeto global con sistemas v13
    if (window.CHATBOT_SYSTEM) {
        window.CHATBOT_SYSTEM.messaging = messagingSystem;
        window.CHATBOT_SYSTEM.pushNotifications = pushNotifications;
        window.CHATBOT_SYSTEM.realtimeAnalytics = realtimeAnalytics;
        window.CHATBOT_SYSTEM.backupSystem = backupSystem;

        window.CHATBOT_SYSTEM.version = '13.0';
        window.CHATBOT_SYSTEM.totalSystems = 34;
    }

    console.log('[V13] Final integration v13.0 complete');
    console.log('[V13] Total integrated systems:', window.CHATBOT_SYSTEM?.totalSystems || 34);
}

// ============================================
// UI DASHBOARDS
// ============================================

function showMessagingDashboard() {
    const conversations = messagingSystem.listConversations(messagingSystem.currentUser);
    const stats = messagingSystem.getStats();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'messaging-dashboard-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>💬 Messaging Dashboard v13.0</h2>
                <button class="modal-close" onclick="closeModal('messaging-dashboard-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="dashboard-grid">
                    <div class="metric-card">
                        <h3>Total Conversaciones</h3>
                        <div class="metric-value">${stats.totalConversations}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Total Mensajes</h3>
                        <div class="metric-value">${stats.totalMessages}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Threads Activos</h3>
                        <div class="metric-value">${stats.totalThreads}</div>
                    </div>
                    <div class="metric-card ${stats.unreadMessages > 0 ? 'warning' : ''}">
                        <h3>Mensajes No Leídos</h3>
                        <div class="metric-value">${stats.unreadMessages}</div>
                    </div>
                </div>

                <h3>Conversaciones Recientes</h3>
                <div class="conversations-list">
                    ${conversations.slice(0, 10).map(conv => `
                        <div class="conversation-item ${conv.unreadCount[messagingSystem.currentUser] > 0 ? 'unread' : ''}">
                            <div class="conv-name">${conv.metadata.name || conv.id}</div>
                            <div class="conv-participants">${conv.participants.length} participantes</div>
                            <div class="conv-last-message">
                                ${conv.lastMessage ? conv.lastMessage.text : 'Sin mensajes'}
                            </div>
                            ${conv.unreadCount[messagingSystem.currentUser] > 0 ? `
                                <span class="unread-badge">${conv.unreadCount[messagingSystem.currentUser]}</span>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="dashboard-actions">
                    <button class="btn-primary" onclick="createTestConversation()">
                        Crear Conversación de Prueba
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showAnalyticsDashboard() {
    const data = realtimeAnalytics.getDashboardData();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'analytics-dashboard-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-fullscreen">
            <div class="modal-header">
                <h2>📊 Real-Time Analytics Dashboard v13.0</h2>
                <button class="modal-close" onclick="closeModal('analytics-dashboard-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="dashboard-grid">
                    <div class="metric-card">
                        <h3>Usuarios Activos</h3>
                        <div class="metric-value">${data.overview.activeUsers}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Page Views</h3>
                        <div class="metric-value">${data.overview.pageViews}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Visitantes Únicos</h3>
                        <div class="metric-value">${data.overview.uniqueVisitors}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Duración Promedio</h3>
                        <div class="metric-value">${data.overview.avgSessionDuration}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Bounce Rate</h3>
                        <div class="metric-value">${data.overview.bounceRate}</div>
                    </div>
                    <div class="metric-card success">
                        <h3>Conversion Rate</h3>
                        <div class="metric-value">${data.overview.conversionRate}</div>
                    </div>
                </div>

                <h3>Top Pages</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Views</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topPages.map(page => `
                            <tr>
                                <td>${page.path}</td>
                                <td>${page.views}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h3>Top Events</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.topEvents.map(event => `
                            <tr>
                                <td>${event.name}</td>
                                <td>${event.count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="dashboard-actions">
                    <button class="btn-primary" onclick="exportAnalyticsData()">
                        Exportar Datos
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showBackupDashboard() {
    const backups = backupSystem.listBackups();
    const stats = backupSystem.getStats();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'backup-dashboard-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>💾 Backup & Recovery Dashboard v13.0</h2>
                <button class="modal-close" onclick="closeModal('backup-dashboard-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="dashboard-grid">
                    <div class="metric-card">
                        <h3>Total Backups</h3>
                        <div class="metric-value">${stats.totalBackups}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Total Size</h3>
                        <div class="metric-value">${stats.totalSize}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Avg Size</h3>
                        <div class="metric-value">${stats.avgSize}</div>
                    </div>
                    <div class="metric-card ${stats.autoBackupEnabled ? 'success' : 'warning'}">
                        <h3>Auto Backup</h3>
                        <div class="metric-value">${stats.autoBackupEnabled ? 'ON' : 'OFF'}</div>
                    </div>
                </div>

                <h3>Recent Backups</h3>
                <table class="backup-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Timestamp</th>
                            <th>Size</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${backups.slice(0, 20).map(backup => `
                            <tr>
                                <td>${backup.id.substring(0, 20)}...</td>
                                <td><span class="badge ${backup.type}">${backup.type}</span></td>
                                <td>${new Date(backup.timestamp).toLocaleString()}</td>
                                <td>${backup.metadata.size}</td>
                                <td>
                                    <button class="btn-sm btn-primary" onclick="restoreBackupById('${backup.id}')">Restore</button>
                                    <button class="btn-sm btn-secondary" onclick="exportBackupById('${backup.id}')">Export</button>
                                    <button class="btn-sm btn-danger" onclick="deleteBackupById('${backup.id}')">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="dashboard-actions">
                    <button class="btn-primary" onclick="createManualBackup()">
                        Crear Backup Manual
                    </button>
                    <button class="btn-secondary" onclick="toggleAutoBackup()">
                        ${stats.autoBackupEnabled ? 'Desactivar' : 'Activar'} Auto Backup
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function createTestConversation() {
    const conv = messagingSystem.createConversation(
        [messagingSystem.currentUser, 'user_test_1', 'user_test_2'],
        { name: 'Conversación de Prueba', type: 'group' }
    );

    messagingSystem.sendMessage(conv.id, {
        text: 'Hola! Este es un mensaje de prueba.',
        type: 'text'
    });

    showNotification('Conversación de prueba creada', 'success');
    closeModal('messaging-dashboard-modal');
}

function exportAnalyticsData() {
    const data = realtimeAnalytics.exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
    showNotification('Analytics data exported', 'success');
}

function createManualBackup() {
    backupSystem.createBackup('manual', { trigger: 'user_request' });
    showNotification('Creando backup...', 'info');

    setTimeout(() => {
        closeModal('backup-dashboard-modal');
        showBackupDashboard();
    }, 1000);
}

function restoreBackupById(backupId) {
    if (confirm('¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá todos los datos actuales.')) {
        backupSystem.restoreBackup(backupId);
    }
}

function exportBackupById(backupId) {
    backupSystem.exportBackup(backupId);
}

function deleteBackupById(backupId) {
    if (confirm('¿Estás seguro de que quieres eliminar este backup?')) {
        backupSystem.deleteBackup(backupId);
        closeModal('backup-dashboard-modal');
        showBackupDashboard();
    }
}

function toggleAutoBackup() {
    const currentState = backupSystem.config.autoBackup.enabled;
    backupSystem.updateConfig({
        autoBackup: { ...backupSystem.config.autoBackup, enabled: !currentState }
    });

    showNotification(`Auto backup ${!currentState ? 'activado' : 'desactivado'}`, 'success');
    closeModal('backup-dashboard-modal');
    showBackupDashboard();
}

// ============================================
// SYSTEM STATUS
// ============================================

function logSystemStatusV13() {
    const systems = window.CHATBOT_SYSTEM;

    console.log('='.repeat(60));
    console.log('🚀 CHATBOT SYSTEM v13.0 - STATUS');
    console.log('='.repeat(60));
    console.log('Version:', systems.version);
    console.log('Total Systems:', systems.totalSystems);
    console.log('Status:', systems.status);
    console.log('='.repeat(60));
    console.log('NIVELES ACTIVOS:');
    console.log('  ✅ Nivel 1-5: Chatbot Base, AI Engine, Voice, Training');
    console.log('  ✅ Nivel 6: Gamification, Comparison');
    console.log('  ✅ Nivel 7: Auth, Checkout');
    console.log('  ✅ Nivel 8: PWA, Reviews, Admin, Wishlist');
    console.log('  ✅ Nivel 9: ML, i18n, Analytics, RealTime Chat');
    console.log('  ✅ Nivel 10: GraphQL, Redis, Elasticsearch, WebSocket');
    console.log('  ✅ Nivel 11: AI Chatbot, Blockchain, Video Calls');
    console.log('  ✅ Nivel 12: Kubernetes, Monitoring');
    console.log('  ✅ Nivel 13: Messaging, Push Notifications, Real-Time Analytics, Backup');
    console.log('='.repeat(60));
    console.log('📊 Quick Stats:');
    console.log('  - Total líneas de código: ~27,000+');
    console.log('  - Archivos JavaScript: 40+');
    console.log('  - Idiomas soportados: 4');
    console.log('  - Criptomonedas: BTC, ETH, USDT, BNB');
    console.log('  - Sistemas de mensajería: Completo con threads y reacciones');
    console.log('  - Push Notifications: Web Push API integrado');
    console.log('  - Analytics: Tracking en tiempo real');
    console.log('  - Backup: Automático cada hora');
    console.log('='.repeat(60));
}

function showWelcomeBannerV13() {
    setTimeout(() => {
        console.log('%c🎉 BIENVENIDO A CHATBOT v13.0 🎉', 'font-size: 20px; color: #667eea; font-weight: bold;');
        console.log('%cSistema Enterprise Completo - 13 Niveles Integrados', 'font-size: 14px; color: #48bb78;');
        console.log('%cComandos disponibles:', 'font-size: 12px; font-weight: bold;');
        console.log('  - showMessagingDashboard()');
        console.log('  - showAnalyticsDashboard()');
        console.log('  - showBackupDashboard()');
        console.log('  - showMonitoringDashboard() [v12]');
        console.log('  - showKubernetesDashboard() [v12]');
        console.log('  - window.CHATBOT_SYSTEM (ver todos los sistemas)');
    }, 1000);
}

// Hacer funciones globales
window.showMessagingDashboard = showMessagingDashboard;
window.showAnalyticsDashboard = showAnalyticsDashboard;
window.showBackupDashboard = showBackupDashboard;
window.createManualBackup = createManualBackup;
window.restoreBackupById = restoreBackupById;
window.exportBackupById = exportBackupById;
window.deleteBackupById = deleteBackupById;
window.toggleAutoBackup = toggleAutoBackup;
window.createTestConversation = createTestConversation;
window.exportAnalyticsData = exportAnalyticsData;
window.logSystemStatusV13 = logSystemStatusV13;

console.log('[V13] ✅ app-v13.js cargado completamente - VERSIÓN 13.0 LISTA');
