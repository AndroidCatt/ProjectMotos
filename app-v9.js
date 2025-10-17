// App V9.0 - Integración de ML, i18n, Analytics Avanzado y Chat en Tiempo Real
// Conecta todas las funcionalidades Enterprise del nivel 9

// Inicializar sistemas del nivel 9
let mlEngine;
let realtimeChat;

// ============================================
// INICIALIZACIÓN NIVEL 9
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[V9] Inicializando funcionalidades del nivel 9...');

    // Inicializar ML Recommendations
    mlEngine = new MLRecommendationEngine();

    // Inicializar Real-Time Chat
    realtimeChat = new RealTimeChatSystem();

    // i18n y analytics ya se inicializan automáticamente

    // Configurar listeners
    setupMLRecommendations();
    setupRealtimeChat();
    setupLanguageSwitcher();

    console.log('[V9] Nivel 9 inicializado correctamente');
    console.log('[V9] Sistemas activos:', {
        ML: !!mlEngine,
        RealTime: !!realtimeChat,
        i18n: !!window.i18n,
        Analytics: !!window.analytics
    });
});

// ============================================
// MACHINE LEARNING RECOMMENDATIONS
// ============================================

function setupMLRecommendations() {
    // Vectorizar todos los productos al iniciar
    if (window.products) {
        window.products.forEach(product => {
            mlEngine.vectorizeProduct(product);
        });

        console.log('[ML] Productos vectorizados:', Object.keys(mlEngine.productVectors).length);
    }

    // Track vistas de productos
    window.addEventListener('product_view', (e) => {
        const { product, userId } = e.detail;
        mlEngine.trackProductView(userId, product.id, product);
    });

    // Track compras
    window.addEventListener('purchase_complete', (e) => {
        const { items, userId } = e.detail;

        items.forEach(item => {
            mlEngine.trackPurchase(userId, item.id, item);
        });
    });
}

function showMLRecommendations(userId, context = {}) {
    const recommendations = mlEngine.getPersonalizedRecommendations(userId, context);

    console.log('[ML] Recomendaciones generadas:', recommendations);

    // Mostrar en UI (implementar modal o sección)
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'recommendations-modal';
    modal.style.display = 'block';

    let recsHTML = '';

    recommendations.forEach(rec => {
        // Buscar producto por ID
        const product = findProductById(rec.productId);

        if (product) {
            recsHTML += `
                <div class="recommendation-card">
                    <div class="product-image">${product.image}</div>
                    <h4>${product.name}</h4>
                    <p class="brand">${product.brand}</p>
                    <p class="price">$${product.price.toLocaleString()}</p>
                    <div class="score">Score: ${rec.score.toFixed(2)}</div>
                    <button class="btn-add" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Agregar al Carrito
                    </button>
                </div>
            `;
        }
    });

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>🤖 Recomendaciones Personalizadas</h2>
                <button class="modal-close" onclick="closeModal('recommendations-modal')">✕</button>
            </div>
            <div class="modal-body">
                <p>Basado en tus preferencias y comportamiento, te recomendamos:</p>
                <div class="recommendations-grid">
                    ${recsHTML || '<p>No hay recomendaciones disponibles en este momento.</p>'}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showSimilarProducts(productId) {
    const similar = mlEngine.findSimilarProducts(productId, 5);

    console.log('[ML] Productos similares:', similar);

    // Mostrar en sección "También te puede interesar"
    const container = document.getElementById('similar-products-container');

    if (container) {
        container.innerHTML = '<h3>También te puede interesar</h3>';

        similar.forEach(sim => {
            const product = findProductById(sim.productId);

            if (product) {
                container.innerHTML += `
                    <div class="similar-product-card">
                        <div>${product.image}</div>
                        <p>${product.name}</p>
                        <p class="similarity">${(sim.similarity * 100).toFixed(0)}% similar</p>
                    </div>
                `;
            }
        });
    }
}

// ============================================
// REAL-TIME CHAT
// ============================================

function setupRealtimeChat() {
    // Listeners de eventos
    realtimeChat.on('message', (message) => {
        console.log('[Chat] Nuevo mensaje:', message);
        displayChatMessage(message);
    });

    realtimeChat.on('typing', (data) => {
        console.log('[Chat] Usuarios escribiendo:', data.users);
        showRealtimeTyping(data.users);
    });

    realtimeChat.on('presence', (data) => {
        console.log('[Chat] Usuarios online:', data.onlineUsers.length);
        updateOnlineUsers(data.onlineUsers);
    });

    // Detectar typing
    const chatInput = document.getElementById('user-input');
    if (chatInput) {
        let typingTimeout;

        chatInput.addEventListener('input', () => {
            realtimeChat.startTyping();

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                realtimeChat.stopTyping();
            }, 1000);
        });
    }
}

function openRealtimeChat() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'realtime-chat-modal';
    modal.style.display = 'block';

    const messages = realtimeChat.getMessages();
    let messagesHTML = '';

    messages.forEach(msg => {
        const isOwn = msg.userId === realtimeChat.userId;
        messagesHTML += `
            <div class="chat-message ${isOwn ? 'own' : ''}">
                <div class="message-header">
                    <strong>${msg.username}</strong>
                    <span class="timestamp">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-text">${msg.text}</div>
                ${msg.edited ? '<span class="edited">(editado)</span>' : ''}
                <div class="message-reactions">
                    ${Object.entries(msg.reactions || {}).map(([emoji, users]) =>
                        `<span class="reaction">${emoji} ${users.length}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>💬 Chat en Tiempo Real</h2>
                <div class="online-count">${realtimeChat.onlineUsers.size} online</div>
                <button class="modal-close" onclick="closeModal('realtime-chat-modal')">✕</button>
            </div>
            <div class="modal-body chat-container">
                <div class="chat-messages" id="realtime-messages">
                    ${messagesHTML}
                </div>
                <div class="typing-indicator" id="typing-indicator" style="display: none;"></div>
                <div class="chat-input">
                    <input type="text" id="realtime-input" placeholder="${window.i18n.t('chatbot.placeholder')}">
                    <button onclick="sendRealtimeMessage()">📨</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Focus en input
    document.getElementById('realtime-input').focus();

    // Enter para enviar
    document.getElementById('realtime-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendRealtimeMessage();
        }
    });
}

function sendRealtimeMessage() {
    const input = document.getElementById('realtime-input');
    const text = input.value.trim();

    if (text) {
        realtimeChat.sendMessage(text);
        input.value = '';
    }
}

function displayChatMessage(message) {
    const container = document.getElementById('realtime-messages');
    if (!container) return;

    const isOwn = message.userId === realtimeChat.userId;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${isOwn ? 'own' : ''}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <strong>${message.username}</strong>
            <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-text">${message.text}</div>
    `;

    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}

function showRealtimeTyping(users) {
    // Renombrado para no colisionar con showTypingIndicator de app.js
    const indicator = document.getElementById('realtime-typing-indicator');
    if (!indicator) return;

    if (users && users.length > 0) {
        indicator.textContent = `${users.join(', ')} está escribiendo...`;
        indicator.style.display = 'block';
    } else if (indicator) {
        indicator.style.display = 'none';
    }
}

function updateOnlineUsers(userIds) {
    const countEl = document.querySelector('.online-count');
    if (countEl) {
        countEl.textContent = `${userIds.length} online`;
    }
}

// ============================================
// LANGUAGE SWITCHER (i18n)
// ============================================

function setupLanguageSwitcher() {
    // Crear selector de idioma en el header
    const header = document.querySelector('.header-actions');

    if (header) {
        const langBtn = document.createElement('button');
        langBtn.id = 'language-btn';
        langBtn.className = 'header-btn';
        langBtn.title = 'Cambiar idioma';
        langBtn.innerHTML = window.i18n.translations[window.i18n.currentLanguage]._meta.flag;

        langBtn.addEventListener('click', () => {
            showLanguageSelector();
        });

        header.appendChild(langBtn);
    }

    // Actualizar al cambiar idioma
    window.addEventListener('languageChanged', () => {
        updateLanguageButton();
        showNotification(window.i18n.t('messages.success'), 'success');
    });
}

function showLanguageSelector() {
    const languages = window.i18n.getSupportedLanguages();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'language-modal';
    modal.style.display = 'block';

    let langsHTML = '';
    languages.forEach(lang => {
        const isActive = lang.code === window.i18n.currentLanguage;

        langsHTML += `
            <button class="language-option ${isActive ? 'active' : ''}"
                    onclick="changeLanguage('${lang.code}')">
                <span class="flag">${lang.flag}</span>
                <span class="name">${lang.nativeName}</span>
                ${isActive ? '<span class="check">✓</span>' : ''}
            </button>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🌍 Seleccionar Idioma / Select Language</h2>
                <button class="modal-close" onclick="closeModal('language-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="language-grid">
                    ${langsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function changeLanguage(langCode) {
    window.i18n.setLanguage(langCode);
    closeModal('language-modal');
    updateLanguageButton();
}

function updateLanguageButton() {
    const btn = document.getElementById('language-btn');
    if (btn) {
        btn.innerHTML = window.i18n.translations[window.i18n.currentLanguage]._meta.flag;
    }
}

// ============================================
// ANALYTICS DASHBOARD
// ============================================

function openAnalyticsDashboard() {
    const metrics = window.analytics.getDashboardMetrics(30);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'analytics-dashboard-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-fullscreen">
            <div class="modal-header">
                <h2>📊 Analytics Dashboard</h2>
                <button class="modal-close" onclick="closeModal('analytics-dashboard-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="analytics-grid">
                    <div class="metric-card">
                        <h3>Usuarios Únicos</h3>
                        <div class="metric-value">${metrics.uniqueUsers}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Sesiones</h3>
                        <div class="metric-value">${metrics.sessions}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Páginas Vistas</h3>
                        <div class="metric-value">${metrics.pageViews}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Tasa de Rebote</h3>
                        <div class="metric-value">${metrics.bounceRate}</div>
                    </div>
                    <div class="metric-card">
                        <h3>Duración Promedio</h3>
                        <div class="metric-value">${metrics.avgSessionDuration}</div>
                    </div>
                </div>

                <h3>Top 10 Eventos</h3>
                <table class="analytics-table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${metrics.topEvents.map(e => `
                            <tr>
                                <td>${e.event}</td>
                                <td>${e.count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="analytics-actions">
                    <button class="btn-primary" onclick="exportAnalytics('json')">
                        Exportar JSON
                    </button>
                    <button class="btn-secondary" onclick="exportAnalytics('csv')">
                        Exportar CSV
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function exportAnalytics(format) {
    const data = window.analytics.exportAnalytics(format);

    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${Date.now()}.${format}`;
    a.click();

    URL.revokeObjectURL(url);

    showNotification(`Analytics exportados en formato ${format.toUpperCase()}`, 'success');
}

// ============================================
// UTILIDADES
// ============================================

function findProductById(productId) {
    // Buscar en productos base
    if (window.products) {
        const found = window.products.find(p => p.id === productId);
        if (found) return found;
    }

    // Buscar en productos personalizados
    const customProducts = JSON.parse(localStorage.getItem('bot_custom_products') || '[]');
    return customProducts.find(p => p.id === productId);
}

// Hacer funciones globales
window.showMLRecommendations = showMLRecommendations;
window.showSimilarProducts = showSimilarProducts;
window.openRealtimeChat = openRealtimeChat;
window.sendRealtimeMessage = sendRealtimeMessage;
window.showLanguageSelector = showLanguageSelector;
window.changeLanguage = changeLanguage;
window.openAnalyticsDashboard = openAnalyticsDashboard;
window.exportAnalytics = exportAnalytics;
