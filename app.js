// Inicializar el chatbot
const bot = new ChatBot();
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const quickSuggestions = document.getElementById('quick-suggestions');

// Historial de conversación
let conversationHistory = [];

// Theme toggle
const toggleThemeBtn = document.getElementById('toggle-theme');
let isDarkMode = false;

toggleThemeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    toggleThemeBtn.textContent = isDarkMode ? '☀️' : '🌙';
    saveToLocalStorage('theme', isDarkMode ? 'dark' : 'light');
});

// Clear chat
document.getElementById('clear-chat').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar el chat?')) {
        chatMessages.innerHTML = '<div class="welcome-banner"><h2>¡Bienvenido! 👋</h2><p>Soy tu asistente virtual para encontrar repuestos de motos. Puedo ayudarte a:</p><ul><li>✓ Buscar repuestos por marca y modelo</li><li>✓ Recomendar piezas por categoría</li><li>✓ Explorar todo nuestro catálogo</li></ul><p class="start-message">Escribe "hola" para comenzar o usa los botones interactivos 🚀</p></div>';
        conversationHistory = [];
        saveConversationHistory();
    }
});

// Restart chatbot
document.getElementById('restart-btn').addEventListener('click', () => {
    bot.reset();
    addMessage('¡Hola de nuevo! ¿En qué puedo ayudarte?', false);
    const welcomeResponse = bot.processMessage('hola');
    if (welcomeResponse.card) {
        createCard(welcomeResponse.card);
    }
});

// LocalStorage functions
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(`chatbot_${key}`, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(`chatbot_${key}`);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return null;
    }
}

function saveConversationHistory() {
    saveToLocalStorage('history', conversationHistory.slice(-50)); // Guardar últimos 50 mensajes
}

function loadConversationHistory() {
    const history = loadFromLocalStorage('history');
    if (history && history.length > 0) {
        conversationHistory = history;
        // No restaurar visualmente para mantener el chat limpio
    }
}

// Mostrar indicador de escritura
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Función para agregar mensajes al chat
function addMessage(message, isUser = false) {
    // Remover welcome banner si existe
    const welcomeBanner = chatMessages.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);

    // Guardar en historial
    conversationHistory.push({
        message,
        isUser,
        timestamp: new Date().toISOString()
    });
    saveConversationHistory();

    // Scroll automático hacia abajo
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Función para crear tarjetas interactivas mejoradas
function createCard(data) {
    // Remover welcome banner si existe
    const welcomeBanner = chatMessages.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.remove();
    }

    const cardDiv = document.createElement('div');
    cardDiv.className = 'message bot-message';

    const card = document.createElement('div');
    card.className = 'card';

    // Header de la tarjeta
    if (data.header) {
        const header = document.createElement('div');
        header.className = 'card-header';
        header.textContent = data.header;
        card.appendChild(header);
    }

    // Texto descriptivo
    if (data.text) {
        const text = document.createElement('p');
        text.textContent = data.text;
        text.style.marginBottom = '8px';
        text.style.fontSize = '14px';
        text.style.color = isDarkMode ? '#e4e6eb' : '#666';
        card.appendChild(text);
    }

    // Opciones con botones
    if (data.options && data.options.length > 0) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'card-options';

        data.options.forEach(option => {
            const button = document.createElement('button');
            button.className = `card-button ${data.type || ''}`;
            button.innerHTML = `<span class="card-button-icon">${option.icon || '▸'}</span><span>${option.label}</span>`;
            button.onclick = () => handleButtonClick(option.value);
            optionsDiv.appendChild(button);
        });

        card.appendChild(optionsDiv);
    }

    // Lista de repuestos mejorada con precios y ratings
    if (data.parts && data.parts.length > 0) {
        const partsList = document.createElement('div');
        partsList.className = 'parts-list-enhanced';

        data.parts.forEach(part => {
            const partCard = document.createElement('div');
            partCard.className = 'part-card';

            // Icono del repuesto
            const partIcon = document.createElement('div');
            partIcon.className = 'part-icon';
            partIcon.textContent = part.image || '🔧';
            partCard.appendChild(partIcon);

            // Información del repuesto
            const partInfo = document.createElement('div');
            partInfo.className = 'part-info';

            const partName = document.createElement('div');
            partName.className = 'part-name';
            partName.textContent = part.name;
            partInfo.appendChild(partName);

            // Precios y descuento
            const partPricing = document.createElement('div');
            partPricing.className = 'part-pricing';

            const finalPrice = bot.calculateFinalPrice(part);

            if (part.discount > 0) {
                const originalPrice = document.createElement('span');
                originalPrice.className = 'original-price';
                originalPrice.textContent = bot.formatPrice(part.price);
                partPricing.appendChild(originalPrice);

                const discountBadge = document.createElement('span');
                discountBadge.className = 'discount-badge';
                discountBadge.textContent = `-${part.discount}%`;
                partPricing.appendChild(discountBadge);
            }

            const finalPriceSpan = document.createElement('span');
            finalPriceSpan.className = 'final-price';
            finalPriceSpan.textContent = bot.formatPrice(finalPrice);
            partPricing.appendChild(finalPriceSpan);

            partInfo.appendChild(partPricing);

            // Rating y stock
            const partMeta = document.createElement('div');
            partMeta.className = 'part-meta';

            const rating = document.createElement('span');
            rating.className = 'part-rating';
            rating.innerHTML = `⭐ ${part.rating.toFixed(1)}`;
            partMeta.appendChild(rating);

            const stock = document.createElement('span');
            stock.className = 'part-stock';
            stock.innerHTML = `📦 ${part.stock} disponibles`;
            stock.style.color = part.stock < 10 ? '#f44336' : '#4caf50';
            partMeta.appendChild(stock);

            partInfo.appendChild(partMeta);
            partCard.appendChild(partInfo);

            // Botones de acción
            const partActions = document.createElement('div');
            partActions.className = 'part-actions';

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'part-action-btn favorite-btn';
            favoriteBtn.innerHTML = '❤️';
            favoriteBtn.title = 'Agregar a favoritos';
            favoriteBtn.onclick = () => {
                if (bot.addToFavorites(part)) {
                    showNotification('❤️ Agregado a favoritos', 'success');
                    favoriteBtn.style.color = '#f44336';
                } else {
                    showNotification('ℹ️ Ya está en favoritos', 'info');
                }
            };
            partActions.appendChild(favoriteBtn);

            const cartBtn = document.createElement('button');
            cartBtn.className = 'part-action-btn cart-btn';
            cartBtn.innerHTML = '🛒';
            cartBtn.title = 'Agregar al carrito';
            cartBtn.onclick = () => {
                bot.addToCart(part);
                showNotification('🛒 Agregado al carrito', 'success');
                updateCartBadge();
            };
            partActions.appendChild(cartBtn);

            partCard.appendChild(partActions);
            partsList.appendChild(partCard);
        });

        card.appendChild(partsList);
    }

    // Botones de acción
    if (data.actions && data.actions.length > 0) {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';

        data.actions.forEach(action => {
            const button = document.createElement('button');
            button.className = `action-button ${action.type || 'primary'}`;
            button.textContent = action.label;
            button.onclick = () => handleButtonClick(action.value);
            actionsDiv.appendChild(button);
        });

        card.appendChild(actionsDiv);
    }

    cardDiv.appendChild(card);
    chatMessages.appendChild(cardDiv);

    // Scroll automático hacia abajo
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-size: 14px;
        font-weight: 500;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Actualizar badge del carrito
function updateCartBadge() {
    const cartCount = bot.cart.reduce((sum, item) => sum + item.quantity, 0);
    let badge = document.querySelector('.cart-badge');

    if (!badge && cartCount > 0) {
        badge = document.createElement('div');
        badge.className = 'cart-badge';
        const restartBtn = document.getElementById('restart-btn');
        restartBtn.style.position = 'relative';
        restartBtn.appendChild(badge);
    }

    if (badge) {
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// Función para manejar clics en botones
function handleButtonClick(value) {
    // Mostrar el mensaje del usuario
    addMessage(value, true);

    // Limpiar input
    userInput.value = '';

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Obtener respuesta del bot con delay realista
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = bot.processMessage(value);

        // Mostrar respuesta del bot
        if (botResponse.card) {
            createCard(botResponse.card);
        } else if (botResponse.response) {
            addMessage(botResponse.response, false);
        }
    }, 500 + Math.random() * 500); // Delay aleatorio entre 500-1000ms
}

// Función para enviar mensaje
function sendMessage() {
    const message = userInput.value.trim();

    if (message === '') return;

    // Mostrar mensaje del usuario
    addMessage(message, true);

    // Limpiar input
    userInput.value = '';

    // Mostrar indicador de escritura
    showTypingIndicator();

    // Obtener respuesta del bot con delay realista
    setTimeout(() => {
        hideTypingIndicator();
        const botResponse = bot.processMessage(message);

        // Mostrar respuesta del bot
        if (botResponse.card) {
            createCard(botResponse.card);
        } else if (botResponse.response) {
            addMessage(botResponse.response, false);
        }
    }, 600 + Math.random() * 600); // Delay aleatorio entre 600-1200ms
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Quick suggestions
quickSuggestions.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
        const message = e.target.getAttribute('data-message');
        userInput.value = message;
        sendMessage();
    }
});

// Auto-resize input
userInput.addEventListener('input', () => {
    // Placeholder para futuras mejoras
});

// Search functionality
const searchBtn = document.getElementById('search-btn');
const searchBar = document.getElementById('search-bar');
const quickSearch = document.getElementById('quick-search');
const closeSearchBtn = document.getElementById('close-search');
const searchResults = document.getElementById('search-results');

searchBtn.addEventListener('click', () => {
    searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
    if (searchBar.style.display === 'block') {
        quickSearch.focus();
    }
});

closeSearchBtn.addEventListener('click', () => {
    searchBar.style.display = 'none';
    quickSearch.value = '';
    searchResults.innerHTML = '';
});

quickSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();

    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    const results = bot.searchParts(query);

    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No se encontraron resultados</div>';
        return;
    }

    searchResults.innerHTML = results.slice(0, 8).map(part => `
        <div class="search-result-item" data-part='${JSON.stringify(part)}'>
            <div class="search-result-icon">${part.image}</div>
            <div class="search-result-info">
                <div class="search-result-name">${part.name}</div>
                <div class="search-result-meta">${part.brand} - ${part.category}</div>
            </div>
            <div class="search-result-price">${bot.formatPrice(bot.calculateFinalPrice(part))}</div>
        </div>
    `).join('');

    // Add click events to search results
    searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const part = JSON.parse(item.getAttribute('data-part'));
            bot.addToCart(part);
            showNotification(`🛒 ${part.name} agregado al carrito`, 'success');
            updateCartBadge();
            searchBar.style.display = 'none';
            quickSearch.value = '';
            searchResults.innerHTML = '';
        });
    });
});

// Favorites button
const favoritesBtn = document.getElementById('favorites-btn');
favoritesBtn.addEventListener('click', () => {
    if (bot.favorites.length === 0) {
        showNotification('❤️ No tienes favoritos aún', 'info');
        return;
    }

    const favoritesMessage = {
        header: '❤️ Tus Favoritos',
        text: `Tienes ${bot.favorites.length} repuestos en favoritos:`,
        parts: bot.favorites,
        partsEnhanced: true,
        actions: [
            { label: '🗑️ Limpiar favoritos', value: 'limpiar_favoritos', type: 'secondary' }
        ]
    };

    createCard(favoritesMessage);
});

// Cart button
const cartBtn = document.getElementById('cart-btn');
cartBtn.addEventListener('click', () => {
    if (bot.cart.length === 0) {
        showNotification('🛒 Tu carrito está vacío', 'info');
        return;
    }

    const total = bot.getTotalCart();
    const cartMessage = {
        header: '🛒 Tu Carrito de Compras',
        text: `Tienes ${bot.cart.reduce((sum, item) => sum + item.quantity, 0)} artículos:`,
        parts: bot.cart,
        partsEnhanced: true
    };

    // Add total to message
    addMessage(`💰 Total: ${bot.formatPrice(total)}`, false);
    createCard(cartMessage);
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();

    // Cargar tema guardado
    const savedTheme = loadFromLocalStorage('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        toggleThemeBtn.textContent = '☀️';
    }

    // Cargar historial
    loadConversationHistory();

    // Actualizar badge del carrito al cargar
    updateCartBadge();

    // Mostrar mensaje de bienvenida mejorado
    console.log('%c🎉 ChatBot Nivel 5 Cargado!', 'color: #667eea; font-size: 18px; font-weight: bold;');
    console.log('%c✨ Nuevas características:', 'color: #764ba2; font-size: 14px;');
    console.log('  • Sistema de precios con descuentos');
    console.log('  • Ratings y disponibilidad');
    console.log('  • Favoritos y carrito de compras');
    console.log('  • Búsqueda inteligente');
    console.log('  • Interfaz mejorada con animaciones');
});

// Prevenir recargas accidentales
window.addEventListener('beforeunload', (e) => {
    if (conversationHistory.length > 1) {
        e.preventDefault();
        e.returnValue = '';
    }
});

console.log('%c🤖 ChatBot de Repuestos Inicializado', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%cVersión: 5.0 - Mejorado con IA', 'color: #764ba2; font-size: 12px;');
