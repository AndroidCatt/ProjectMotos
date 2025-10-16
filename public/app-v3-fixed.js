// ==================== ESTADO GLOBAL ====================
const auth = {
    user: null,
    token: null
};

const app = {
    sessionId: generateSessionId(),
    conversationState: {
        step: 'greeting',
        selectedBrand: null,
        selectedModel: null,
        selectedCategory: null
    },
    brands: [],
    categories: [],
    parts: [],
    useGPT: false // Desactivar GPT hasta tener créditos
};

// Generar ID de sesión único
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==================== ELEMENTOS DOM ====================
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

// ==================== AUTENTICACIÓN ====================

function loadSession() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        auth.token = token;
        auth.user = JSON.parse(user);
        updateUserUI();
        loadCartCount();
    }
}

function updateUserUI() {
    if (auth.user) {
        document.getElementById('user-info').style.display = 'flex';
        document.getElementById('guest-section').style.display = 'none';
        document.getElementById('username-display').textContent = auth.user.username;

        let accountHtml = `
            <p><strong>Usuario:</strong> ${auth.user.username}</p>
            <p><strong>Email:</strong> ${auth.user.email}</p>
        `;
        if (auth.user.role === 'admin') {
            accountHtml += '<p style="color: var(--accent-color); font-weight: 600;">👑 Administrador</p>';
        }
        document.getElementById('account-info').innerHTML = accountHtml;
    } else {
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('guest-section').style.display = 'block';
        document.getElementById('account-info').innerHTML = '<p>Inicia sesión para acceder a tu cuenta</p>';
    }
}

function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'block';
}

function showLogin() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        addMessage('Por favor completa todos los campos', false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            auth.token = data.token;
            auth.user = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('auth-modal').style.display = 'none';
            updateUserUI();
            loadCartCount();
            addMessage('✅ ¡Bienvenido ' + data.user.username + '!', false);
        } else {
            addMessage('❌ Error: ' + data.error, false);
        }
    } catch (error) {
        addMessage('❌ Error al iniciar sesión', false);
        console.error(error);
    }
}

async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const full_name = document.getElementById('reg-fullname').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;

    if (!username || !email || !password) {
        addMessage('Por favor completa los campos requeridos', false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, full_name, phone, address })
        });

        const data = await response.json();

        if (response.ok) {
            auth.token = data.token;
            auth.user = data.user;
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            document.getElementById('auth-modal').style.display = 'none';
            updateUserUI();
            addMessage('✅ ¡Registro exitoso! Bienvenido ' + data.user.username, false);
        } else {
            addMessage('❌ Error: ' + data.error, false);
        }
    } catch (error) {
        addMessage('❌ Error al registrarse', false);
        console.error(error);
    }
}

function logout() {
    auth.token = null;
    auth.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserUI();
    document.getElementById('cart-count').textContent = '0';
    addMessage('Sesión cerrada', false);
}

// ==================== CARRITO ====================

async function loadCartCount() {
    if (!auth.token) return;
    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (response.ok) {
            const data = await response.json();
            document.getElementById('cart-count').textContent = data.count;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function addToCart(partId) {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para agregar al carrito', false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ part_id: partId, quantity: 1 })
        });

        if (response.ok) {
            addMessage('✅ Producto agregado al carrito', false);
            loadCartCount();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function viewCart() {
    if (!auth.token) {
        showAuthModal();
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cart', {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (response.ok) {
            const data = await response.json();
            displayCart(data);
            document.getElementById('cart-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayCart(data) {
    const cartContent = document.getElementById('cart-content');
    const cartSummary = document.getElementById('cart-summary');

    if (data.items.length === 0) {
        cartContent.innerHTML = '<p class="message-info">Tu carrito está vacío</p>';
        cartSummary.innerHTML = '';
        return;
    }

    let html = '';
    data.items.forEach(item => {
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
            </div>
        `;
    });

    cartContent.innerHTML = html;
    cartSummary.innerHTML = `
        <div class="cart-summary">
            <div class="cart-total">Total: $${formatPrice(data.total)}</div>
            <button class="btn-checkout" onclick="checkout()">Realizar Pedido</button>
        </div>
    `;
}

async function updateCartQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(cartId);
        return;
    }
    try {
        await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });
        viewCart();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function removeFromCart(cartId) {
    try {
        await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        viewCart();
        loadCartCount();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function checkout() {
    const address = prompt('Ingresa tu dirección de entrega:');
    if (!address) return;

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ delivery_address: address })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('cart-modal').style.display = 'none';
            addMessage(`✅ ¡Pedido realizado! #${data.order_id} - Total: $${formatPrice(data.total)}`, false);
            loadCartCount();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

// ==================== PEDIDOS ====================

async function viewOrders() {
    if (!auth.token) {
        showAuthModal();
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
            document.getElementById('orders-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayOrders(orders) {
    const ordersContent = document.getElementById('orders-content');
    if (orders.length === 0) {
        ordersContent.innerHTML = '<p class="message-info">No tienes pedidos</p>';
        return;
    }
    let html = '';
    orders.forEach(order => {
        html += `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-id">Pedido #${order.id}</div>
                    <div class="order-status ${order.status}">${order.status}</div>
                </div>
                <p>📅 ${new Date(order.created_at).toLocaleDateString()}</p>
                <p>📍 ${order.delivery_address}</p>
                <div class="order-total">$${formatPrice(order.total)}</div>
            </div>
        `;
    });
    ordersContent.innerHTML = html;
}

function closeOrdersModal() {
    document.getElementById('orders-modal').style.display = 'none';
}

// ==================== FAVORITOS ====================

async function addToFavorites(partId) {
    if (!auth.token) {
        showAuthModal();
        return;
    }
    try {
        await fetch('http://localhost:3000/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ part_id: partId })
        });
        addMessage('❤️ Agregado a favoritos', false);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function viewFavorites() {
    if (!auth.token) {
        showAuthModal();
        return;
    }
    try {
        const response = await fetch('http://localhost:3000/api/favorites', {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (response.ok) {
            const favorites = await response.json();
            displayFavorites(favorites);
            document.getElementById('favorites-modal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayFavorites(favorites) {
    const favoritesContent = document.getElementById('favorites-content');
    if (favorites.length === 0) {
        favoritesContent.innerHTML = '<p class="message-info">No tienes favoritos</p>';
        return;
    }
    let html = '';
    favorites.forEach(fav => {
        html += createPartCardV3({
            id: fav.part_id,
            name: fav.name,
            price: fav.price,
            stock: fav.stock,
            description: fav.description
        });
    });
    favoritesContent.innerHTML = html;
}

function closeFavoritesModal() {
    document.getElementById('favorites-modal').style.display = 'none';
}

// ==================== CHATBOT ====================

function createPartCardV3(part) {
    const partId = part.id || part.part_id;
    const brandName = part.brand_name || 'Universal';
    const categoryName = part.category_name || '';
    const imageUrl = part.image_url || 'https://via.placeholder.com/300x300/3498db/ffffff?text=Repuesto';
    const rating = part.rating_average || 0;
    const reviewCount = part.review_count || 0;

    // Determinar color del badge según la marca
    const brandColors = {
        'Auteco': '#e74c3c',
        'AKT': '#3498db',
        'TVS': '#9b59b6',
        'Boxer': '#f39c12',
        'Universal': '#95a5a6'
    };

    const brandColor = brandColors[brandName] || '#95a5a6';

    // Crear estrellas de calificación
    const stars = createStars(rating);

    return `
        <div class="part-card-v3 animate-in">
            <img src="${imageUrl}" alt="${part.name}" class="part-image" style="width: 100%; height: 180px; object-fit: cover; border-radius: 8px 8px 0 0;" onerror="this.src='https://via.placeholder.com/300x300/3498db/ffffff?text=Repuesto'">
            <div class="part-info">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div class="part-name">${part.name}</div>
                    <span style="background: ${brandColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap; margin-left: 8px;">
                        🏍️ ${brandName}
                    </span>
                </div>
                ${categoryName ? `<div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">📁 ${categoryName}</div>` : ''}

                <div class="rating-info" style="margin-bottom: 8px;">
                    ${stars}
                    ${reviewCount > 0 ? `<span style="font-size: 12px; color: #7f8c8d;">(${reviewCount} ${reviewCount === 1 ? 'opinión' : 'opiniones'})</span>` : '<span style="font-size: 12px; color: #7f8c8d;">Sin opiniones</span>'}
                </div>

                <div class="part-price" style="font-size: 20px; font-weight: 700; color: #27ae60; margin-bottom: 5px;">$${formatPrice(part.price)}</div>
                <div class="part-stock" style="font-size: 13px; color: ${part.stock > 10 ? '#27ae60' : '#e74c3c'};">📦 Stock: ${part.stock} unidades</div>
                ${part.description ? `<div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">${part.description}</div>` : ''}
                ${part.compatible_models ? `<div style="font-size: 11px; color: #27ae60; margin-top: 5px;">✅ Compatible: ${part.compatible_models}</div>` : ''}
            </div>
            <div class="part-actions" style="padding: 0 15px 15px; display: flex; gap: 8px; justify-content: space-between;">
                <button class="btn-icon btn-cart" onclick="addToCart(${partId})" title="Agregar al carrito">🛒</button>
                <button class="btn-icon btn-favorite" onclick="addToFavorites(${partId})" title="Agregar a favoritos">❤️</button>
                <button class="btn-icon" onclick="showReviews(${partId})" title="Ver opiniones" style="background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px;">⭐ ${rating.toFixed(1)}</button>
            </div>
        </div>
    `;
}

// Función para crear estrellas de calificación
function createStars(rating) {
    let starsHTML = '<div class="rating-stars" style="display: inline-flex; gap: 2px;">';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '<span style="color: #f39c12;">★</span>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            starsHTML += '<span style="color: #f39c12;">☆</span>';
        } else {
            starsHTML += '<span style="color: #ddd;">★</span>';
        }
    }
    starsHTML += '</div>';
    return starsHTML;
}

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    if (message.includes('<div') || message.includes('<span') || message.includes('<br')) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

async function loadInitialData() {
    try {
        const [brandsRes, categoriesRes, partsRes] = await Promise.all([
            fetch('http://localhost:3000/api/brands'),
            fetch('http://localhost:3000/api/categories'),
            fetch('http://localhost:3000/api/parts')
        ]);

        app.brands = await brandsRes.json();
        app.categories = await categoriesRes.json();
        app.parts = await partsRes.json();
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Mostrar categorías con información de marcas
async function showCategoriesWithBrands() {
    let html = '<div style="font-size: 16px; font-weight: 600; margin-bottom: 15px;">📋 Categorías de Repuestos</div>';

    // Agrupar repuestos por categoría y marca
    const categoryStats = {};

    app.categories.forEach(cat => {
        categoryStats[cat.id] = {
            name: cat.name,
            brands: new Set(),
            count: 0
        };
    });

    app.parts.forEach(part => {
        if (categoryStats[part.category_id]) {
            categoryStats[part.category_id].brands.add(part.brand_name);
            categoryStats[part.category_id].count++;
        }
    });

    // Crear cards para cada categoría
    Object.values(categoryStats).forEach(stat => {
        const brandsText = Array.from(stat.brands).join(', ');
        html += `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 10px; border-left: 4px solid #3498db; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
                <div style="font-weight: 600; font-size: 15px; margin-bottom: 5px;">📁 ${stat.name}</div>
                <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">
                    🏍️ Marcas: ${brandsText || 'Universal'}
                </div>
                <div style="font-size: 12px; color: #27ae60;">
                    ✅ ${stat.count} repuestos disponibles
                </div>
            </div>
        `;
    });

    html += '<div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-size: 13px;">💡 Escribe el nombre de la categoría para ver los repuestos</div>';

    return html;
}

// Mostrar repuestos por marca
async function showPartsByBrand(brand) {
    const brandParts = app.parts.filter(p => p.brand_name === brand.name);

    if (brandParts.length === 0) {
        return `No hay repuestos disponibles para ${brand.name}`;
    }

    let html = `<div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">🏍️ Repuestos para ${brand.name}</div>`;
    html += `<div style="font-size: 13px; color: #7f8c8d; margin-bottom: 15px;">${brand.description || ''}</div>`;

    brandParts.slice(0, 10).forEach(part => {
        html += createPartCardV3(part);
    });

    return html;
}

async function processMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Comandos especiales
    if (lowerMessage.includes('mostrar todo') || lowerMessage.includes('catalogo') || lowerMessage.includes('catálogo')) {
        let html = '<div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">📦 Catálogo de Repuestos Disponibles</div>';
        html += '<div style="font-size: 13px; color: #7f8c8d; margin-bottom: 15px;">🏍️ Marcas: Auteco, AKT, TVS y Boxer</div>';
        app.parts.slice(0, 12).forEach(part => {
            html += createPartCardV3(part);
        });
        return html;
    }

    if (lowerMessage.includes('categoria') || lowerMessage.includes('categoría') || lowerMessage.includes('menu')) {
        return await showCategoriesWithBrands();
    }

    // Comando para búsqueda avanzada
    if (lowerMessage.includes('filtro') || lowerMessage.includes('búsqueda avanzada') || lowerMessage.includes('busqueda avanzada')) {
        showAdvancedSearch();
        return '🔍 Aquí tienes los filtros de búsqueda avanzada. Puedes filtrar por marca, categoría, precio, calificación y más.';
    }

    // Detectar si están buscando por marca específica
    const brandMatch = app.brands.find(b => lowerMessage.includes(b.name.toLowerCase()));
    if (brandMatch && (lowerMessage.includes('repuesto') || lowerMessage.includes('mostrar') || lowerMessage.includes('ver'))) {
        return await showPartsByBrand(brandMatch);
    }

    // Usar GPT si está activado
    if (app.useGPT) {
        try {
            const response = await fetch('http://localhost:3000/api/chat/gpt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context: app.conversationState })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            } else {
                // Fallback a búsqueda normal si GPT falla
                return await handleSearch(message);
            }
        } catch (error) {
            console.error('Error con GPT:', error);
            return await handleSearch(message);
        }
    } else {
        return await handleSearch(message);
    }
}

async function handleSearch(message) {
    const lowerMessage = message.toLowerCase();

    // Buscar por categoría específica
    const categoryMatch = app.categories.find(c =>
        lowerMessage.includes(c.name.toLowerCase())
    );

    if (categoryMatch) {
        const categoryParts = app.parts.filter(p => p.category_id === categoryMatch.id);

        if (categoryParts.length > 0) {
            // Obtener marcas únicas en esta categoría
            const brands = [...new Set(categoryParts.map(p => p.brand_name))];

            let html = `<div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">📁 ${categoryMatch.name}</div>`;
            html += `<div style="font-size: 13px; color: #7f8c8d; margin-bottom: 15px;">🏍️ Disponible para: ${brands.join(', ')}</div>`;

            categoryParts.slice(0, 10).forEach(part => {
                html += createPartCardV3(part);
            });

            return html;
        }
    }

    // Detectar intención
    const isQuestion = lowerMessage.includes('?') ||
                      lowerMessage.includes('cuanto') ||
                      lowerMessage.includes('cuánto') ||
                      lowerMessage.includes('como') ||
                      lowerMessage.includes('cómo') ||
                      lowerMessage.includes('que') ||
                      lowerMessage.includes('qué');

    const isPriceQuery = lowerMessage.includes('precio') ||
                        lowerMessage.includes('cuesta') ||
                        lowerMessage.includes('valor');

    const isAvailability = lowerMessage.includes('disponible') ||
                          lowerMessage.includes('stock') ||
                          lowerMessage.includes('hay');

    const isRecommendation = lowerMessage.includes('recomienda') ||
                            lowerMessage.includes('sugerir') ||
                            lowerMessage.includes('mejor');

    try {
        const response = await fetch('http://localhost:3000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message })
        });

        const parts = await response.json();

        if (parts.length > 0) {
            let html = '';

            // Respuesta personalizada según la intención
            if (isPriceQuery) {
                html = '<div>💰 Aquí están los precios de los repuestos encontrados:</div>';
            } else if (isAvailability) {
                html = '<div>📦 Disponibilidad de repuestos:</div>';
            } else if (isRecommendation) {
                html = '<div>⭐ Te recomiendo estos repuestos:</div>';
            } else if (isQuestion) {
                html = '<div>✅ Aquí está la información que buscas:</div>';
            } else {
                html = '<div>🔍 Encontré estos repuestos para ti:</div>';
            }

            parts.slice(0, 6).forEach(part => {
                html += createPartCardV3(part);
            });

            // Agregar sugerencias adicionales
            if (isPriceQuery) {
                const total = parts.slice(0, 6).reduce((sum, p) => sum + p.price, 0);
                html += `<div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px;">
                    💡 <strong>Tip:</strong> El rango de precios es de $${formatPrice(Math.min(...parts.map(p => p.price)))} a $${formatPrice(Math.max(...parts.map(p => p.price)))}
                </div>`;
            }

            return html;
        } else {
            // Respuestas inteligentes cuando no hay resultados
            const suggestions = [];

            if (lowerMessage.includes('filtro')) {
                suggestions.push('Filtro de aceite', 'Filtro de aire');
            } else if (lowerMessage.includes('freno')) {
                suggestions.push('Pastillas de freno', 'Disco de freno');
            } else if (lowerMessage.includes('motor')) {
                suggestions.push('Bujía', 'Pistón', 'Kit de arrastre');
            }

            let html = '<div class="message-info">❌ No encontré repuestos específicos con esa búsqueda.</div>';

            if (suggestions.length > 0) {
                html += '<div style="margin-top: 10px;">💡 ¿Buscabas algo como esto?</div>';
                for (const sug of suggestions) {
                    const sugParts = app.parts.filter(p =>
                        p.name.toLowerCase().includes(sug.toLowerCase())
                    ).slice(0, 2);

                    sugParts.forEach(part => {
                        html += createPartCardV3(part);
                    });
                }
            } else {
                html += `<div style="margin-top: 10px;">
                    <strong>Prueba con:</strong><br>
                    • "mostrar todo" - Ver catálogo completo<br>
                    • "categorías" - Ver por tipo<br>
                    • Busca por: filtro, freno, cadena, batería, etc.
                </div>`;
            }

            return html;
        }
    } catch (error) {
        console.error('Error:', error);
        return '❌ Error en la búsqueda. Por favor intenta de nuevo.';
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage(message, true);
    userInput.value = '';
    showTyping();

    try {
        const response = await processMessage(message);
        hideTyping();
        addMessage(response, false);
    } catch (error) {
        hideTyping();
        addMessage('❌ Error al procesar el mensaje', false);
        console.error('Error:', error);
    }
}

function sendSuggestion(text) {
    userInput.value = text;
    sendMessage();
}

function quickSearch(query) {
    userInput.value = query;
    sendMessage();
}

function resetChat() {
    chatMessages.innerHTML = '';
    addMessage('Chat reiniciado. ¿En qué puedo ayudarte?', false);
}

// ==================== NIVEL 3.5 - NUEVAS FUNCIONALIDADES ====================

// Variables globales para reviews
let currentReviewPartId = null;
let selectedRating = 0;

// ==================== SISTEMA DE REVIEWS ====================

async function showReviews(partId) {
    currentReviewPartId = partId;
    const part = app.parts.find(p => p.id === partId);

    if (!part) return;

    document.getElementById('review-product-name').textContent = `Opiniones: ${part.name}`;
    document.getElementById('review-modal').style.display = 'block';

    // Cargar reviews existentes
    try {
        const response = await fetch(`http://localhost:3000/api/reviews/${partId}`);
        const reviews = await response.json();

        let reviewsHTML = '';
        if (reviews.length > 0) {
            reviewsHTML = '<h3>Opiniones de clientes</h3>';
            reviews.forEach(review => {
                const stars = createStars(review.rating);
                const date = new Date(review.created_at).toLocaleDateString('es-CO');
                reviewsHTML += `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="review-author">${review.full_name || review.username}</span>
                            <span class="review-date">${date}</span>
                        </div>
                        ${stars}
                        ${review.comment ? `<div class="review-comment">${review.comment}</div>` : ''}
                    </div>
                `;
            });
        } else {
            reviewsHTML = '<p style="color: #7f8c8d; padding: 20px; text-align: center;">Aún no hay opiniones para este producto. ¡Sé el primero en opinar!</p>';
        }

        document.getElementById('existing-reviews').innerHTML = reviewsHTML;

        // Mostrar formulario solo si está autenticado
        if (auth.user) {
            document.getElementById('review-form-container').style.display = 'block';
            // Reset form
            selectedRating = 0;
            document.getElementById('review-comment').value = '';
            updateStarSelection();
        } else {
            document.getElementById('review-form-container').style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar reviews:', error);
        addMessage('Error al cargar opiniones', false);
    }
}

function selectRating(rating) {
    selectedRating = rating;
    updateStarSelection();
}

function updateStarSelection() {
    const stars = document.querySelectorAll('#rating-selector .star');
    stars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.remove('empty');
        } else {
            star.classList.add('empty');
        }
    });
}

async function submitReview() {
    if (!auth.user) {
        addMessage('Debes iniciar sesión para dejar una opinión', false);
        return;
    }

    if (selectedRating === 0) {
        alert('Por favor selecciona una calificación');
        return;
    }

    const comment = document.getElementById('review-comment').value;

    try {
        const response = await fetch('http://localhost:3000/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({
                part_id: currentReviewPartId,
                rating: selectedRating,
                comment: comment
            })
        });

        const data = await response.json();

        if (response.ok) {
            addMessage('✅ ¡Gracias por tu opinión!', false);
            closeReviewModal();
            // Recargar datos para actualizar ratings
            await loadInitialData();
        } else {
            addMessage(`❌ ${data.error}`, false);
        }
    } catch (error) {
        console.error('Error al enviar review:', error);
        addMessage('Error al enviar opinión', false);
    }
}

function closeReviewModal() {
    document.getElementById('review-modal').style.display = 'none';
    currentReviewPartId = null;
    selectedRating = 0;
}

// ==================== BÚSQUEDA AVANZADA CON FILTROS ====================

async function showAdvancedSearch() {
    const filtersHTML = `
        <div class="filters-panel">
            <div class="filters-title">🔍 Búsqueda Avanzada</div>
            <div class="filters-grid">
                <div class="filter-group">
                    <label>Texto</label>
                    <input type="text" id="filter-query" placeholder="Buscar...">
                </div>
                <div class="filter-group">
                    <label>Marca</label>
                    <select id="filter-brand">
                        <option value="">Todas</option>
                        ${app.brands.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Categoría</label>
                    <select id="filter-category">
                        <option value="">Todas</option>
                        ${app.categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Precio Mínimo</label>
                    <input type="number" id="filter-min-price" placeholder="0">
                </div>
                <div class="filter-group">
                    <label>Precio Máximo</label>
                    <input type="number" id="filter-max-price" placeholder="1000000">
                </div>
                <div class="filter-group">
                    <label>Calificación Mínima</label>
                    <select id="filter-rating">
                        <option value="">Todas</option>
                        <option value="4">⭐ 4+</option>
                        <option value="3">⭐ 3+</option>
                        <option value="2">⭐ 2+</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Stock</label>
                    <select id="filter-stock">
                        <option value="">Todos</option>
                        <option value="true">Solo disponibles</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Ordenar por</label>
                    <select id="filter-sort">
                        <option value="name">Nombre</option>
                        <option value="price">Precio</option>
                        <option value="rating_average">Calificación</option>
                        <option value="stock">Stock</option>
                    </select>
                </div>
            </div>
            <div class="filters-actions">
                <button class="filter-btn secondary" onclick="clearFilters()">Limpiar</button>
                <button class="filter-btn primary" onclick="applyFilters()">Buscar</button>
            </div>
        </div>
        <div id="filter-results"></div>
    `;

    addMessage(filtersHTML, false);
}

async function applyFilters() {
    const query = document.getElementById('filter-query').value;
    const brand = document.getElementById('filter-brand').value;
    const category = document.getElementById('filter-category').value;
    const minPrice = document.getElementById('filter-min-price').value;
    const maxPrice = document.getElementById('filter-max-price').value;
    const minRating = document.getElementById('filter-rating').value;
    const inStock = document.getElementById('filter-stock').value;
    const sortBy = document.getElementById('filter-sort').value;

    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (brand) params.append('brand', brand);
    if (category) params.append('category', category);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (minRating) params.append('minRating', minRating);
    if (inStock) params.append('inStock', inStock);
    params.append('sortBy', sortBy);
    params.append('order', 'ASC');

    try {
        const response = await fetch(`http://localhost:3000/api/search/advanced?${params}`);
        const parts = await response.json();

        let resultsHTML = `<div style="font-size: 16px; font-weight: 600; margin: 20px 0 10px;">Resultados: ${parts.length} productos encontrados</div>`;

        if (parts.length > 0) {
            parts.forEach(part => {
                resultsHTML += createPartCardV3(part);
            });
        } else {
            resultsHTML += '<p style="color: #7f8c8d; padding: 20px; text-align: center;">No se encontraron productos con estos filtros</p>';
        }

        document.getElementById('filter-results').innerHTML = resultsHTML;
    } catch (error) {
        console.error('Error en búsqueda avanzada:', error);
        addMessage('Error al realizar la búsqueda', false);
    }
}

function clearFilters() {
    document.getElementById('filter-query').value = '';
    document.getElementById('filter-brand').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-rating').value = '';
    document.getElementById('filter-stock').value = '';
    document.getElementById('filter-sort').value = 'name';
    document.getElementById('filter-results').innerHTML = '';
}

// ==================== DASHBOARD DE ADMINISTRACIÓN ====================

async function showAdminDashboard() {
    if (!auth.user || auth.user.role !== 'admin') {
        addMessage('⛔ No tienes permisos de administrador', false);
        return;
    }

    document.getElementById('admin-dashboard-modal').style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });

        const stats = await response.json();

        let dashboardHTML = `
            <div class="dashboard-grid">
                <div class="stat-card primary">
                    <div class="stat-label">Usuarios Registrados</div>
                    <div class="stat-value">${stats.totalUsers}</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-label">Total Pedidos</div>
                    <div class="stat-value">${stats.totalOrders}</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-label">Ingresos Totales</div>
                    <div class="stat-value">$${formatPrice(stats.totalRevenue || 0)}</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-label">Productos Totales</div>
                    <div class="stat-value">${stats.totalParts}</div>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">📈 Productos Más Vendidos</div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Marca</th>
                                <th>Vendidos</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.topProducts && stats.topProducts.length > 0 ? stats.topProducts.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.brand_name}</td>
                                    <td>${p.sold}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="3" style="text-align: center;">No hay datos de ventas</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">⚠️ Productos con Bajo Stock</div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Marca</th>
                                <th>Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.lowStock && stats.lowStock.length > 0 ? stats.lowStock.map(p => `
                                <tr>
                                    <td>${p.name}</td>
                                    <td>${p.brand_name}</td>
                                    <td style="color: ${p.stock < 5 ? '#e74c3c' : '#f39c12'}; font-weight: 600;">${p.stock}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="3" style="text-align: center;">Todos los productos tienen stock adecuado</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="chart-container">
                <div class="chart-title">⭐ Últimas Opiniones</div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Producto</th>
                                <th>Calificación</th>
                                <th>Comentario</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${stats.recentReviews && stats.recentReviews.length > 0 ? stats.recentReviews.map(r => `
                                <tr>
                                    <td>${r.username}</td>
                                    <td>${r.part_name}</td>
                                    <td>${createStars(r.rating)}</td>
                                    <td>${r.comment || '-'}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center;">No hay opiniones aún</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('dashboard-content').innerHTML = dashboardHTML;
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        document.getElementById('dashboard-content').innerHTML = '<p style="color: red;">Error al cargar estadísticas</p>';
    }
}

function closeAdminDashboard() {
    document.getElementById('admin-dashboard-modal').style.display = 'none';
}

// Actualizar updateUserUI para mostrar botón de dashboard si es admin
const originalUpdateUserUI = updateUserUI;
updateUserUI = function() {
    originalUpdateUserUI();
    if (auth.user && auth.user.role === 'admin') {
        document.getElementById('admin-dashboard-btn').style.display = 'inline-block';
    } else {
        document.getElementById('admin-dashboard-btn').style.display = 'none';
    }
};

// ==================== EVENT LISTENERS ====================

if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        this.closest('.modal').style.display = 'none';
    };
});

// ==================== INICIALIZACIÓN ====================

window.addEventListener('load', async () => {
    console.log('Iniciando aplicación...');

    loadSession();
    await loadInitialData();

    setTimeout(() => {
        const userGreeting = auth.user ? `¡Hola ${auth.user.username}!` : '¡Hola!';
        const gptStatus = app.useGPT ? '🤖 Con IA GPT activada' : '🔍 Con búsqueda inteligente';

        const welcomeMsg = `${userGreeting} 👋

🏍️ ChatBot de Repuestos para Motos Colombianas - Versión 3.5
${gptStatus}

💬 Puedo ayudarte con:
• "mostrar todo" - Ver catálogo completo con imágenes
• "categorías" - Ver por tipo de repuesto
• "filtros" - Búsqueda avanzada con filtros
• "¿Cuánto cuesta un filtro de aceite?" - Consultar precios
• "¿Hay pastillas de freno disponibles?" - Ver stock
• "Recomiéndame repuestos para Auteco" - Recomendaciones

✨ Nuevas funcionalidades v3.5:
• 📸 Imágenes de productos
• ⭐ Sistema de calificaciones y opiniones
• 🔍 Búsqueda avanzada con filtros
• 📊 Dashboard administrativo (solo admin)

🛒 Acciones en productos:
• Haz clic en 🛒 para agregar al carrito
• Haz clic en ❤️ para agregar a favoritos
• Haz clic en ⭐ para ver opiniones y calificar
${!auth.user ? '• Inicia sesión para comprar y calificar' : '• ¡Ya puedes comprar y dejar opiniones!'}

${!app.useGPT ? '💡 Tip: Para activar GPT, agrega créditos en platform.openai.com' : ''}

¿Qué necesitas?`;

        addMessage(welcomeMsg, false);
        console.log('Aplicación iniciada correctamente');
        console.log('GPT activado:', app.useGPT);
    }, 500);
});
