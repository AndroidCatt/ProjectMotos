// Incluir funciones de autenticación
// (El archivo app-v3-auth.js debe cargarse primero en el HTML)

// Estado de la aplicación
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
    parts: []
};

// Generar ID de sesión único
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Elementos DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const sessionIdEl = document.getElementById('session-id');
const partsCountEl = document.getElementById('parts-count');

// Inicializar
sessionIdEl.textContent = app.sessionId.substr(-8);

// Agregar mensaje al chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;

    // Detectar si el mensaje contiene HTML
    if (message.includes('<div') || message.includes('<span') || message.includes('<br')) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Agregar tarjeta de repuesto con botones de acción (Nivel 3)
function createPartCard(part) {
    return createPartCardV3(part);
}

function createPartCardV3(part) {
    const partId = part.id || part.part_id;
    const stockClass = part.stock > 10 ? 'in-stock' : (part.stock > 0 ? 'low-stock' : 'out-of-stock');
    const stockText = part.stock > 0 ? `${part.stock} unid.` : 'Agotado';

    return `
        <div class="part-card-v3">
            <div class="part-info">
                <div class="part-name" title="${part.name}">${part.name}</div>
                <div class="part-details">
                    <div class="part-price">$${formatPrice(part.price)}</div>
                    ${part.brand ? `<span class="part-brand">${part.brand}</span>` : ''}
                    <span class="part-stock ${stockClass}">${stockText}</span>
                    ${part.category ? `<span class="category-tag">${part.category}</span>` : ''}
                </div>
            </div>
            <div class="part-actions">
                <button class="btn-icon btn-cart" onclick="addToCart(${partId})" title="Agregar al carrito">🛒</button>
                <button class="btn-icon btn-favorite ${isFavorite(partId) ? 'active' : ''}" onclick="toggleFavorite(${partId})" title="Favoritos">❤️</button>
                <button class="btn-icon btn-compare" onclick="addToCompare(${partId})" title="Comparar" style="background: #9b59b6;">⚖️</button>
                <button class="btn-icon btn-info" onclick="showProductDetails(${partId})" title="Ver detalles" style="background: #f39c12;">ℹ️</button>
            </div>
        </div>
    `;
}

// Funciones auxiliares para los botones
function isFavorite(partId) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(partId);
}

function toggleFavorite(partId) {
    if (typeof addToFavorites === 'function') {
        addToFavorites(partId);
    }
}

function addToCompare(partId) {
    const compareList = JSON.parse(localStorage.getItem('compareList') || '[]');
    if (!compareList.includes(partId)) {
        compareList.push(partId);
        localStorage.setItem('compareList', JSON.stringify(compareList));
        addMessage(`Producto agregado a comparación (${compareList.length} productos)`, false);
    } else {
        addMessage('Este producto ya está en tu lista de comparación', false);
    }
}

function showProductDetails(partId) {
    const part = app.parts.find(p => (p.id || p.part_id) === partId);
    if (part) {
        let details = `
📦 Detalles del Producto

Nombre: ${part.name}
Precio: $${formatPrice(part.price)}
Stock: ${part.stock} unidades
${part.brand ? `Marca: ${part.brand}` : ''}
${part.category ? `Categoría: ${part.category}` : ''}
${part.description ? `Descripción: ${part.description}` : ''}
${part.warranty ? `Garantía: ${part.warranty}` : ''}

¿Deseas agregarlo al carrito?`;
        addMessage(details, false);
    }
}

// Formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-CO').format(price);
}

// Scroll automático
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mostrar indicador de escritura
function showTyping() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

// Ocultar indicador de escritura
function hideTyping() {
    typingIndicator.style.display = 'none';
}

// Cargar datos iniciales
async function loadInitialData() {
    try {
        const brandsRes = await fetch('http://localhost:3000/api/brands');
        app.brands = await brandsRes.json();

        const categoriesRes = await fetch('http://localhost:3000/api/categories');
        app.categories = await categoriesRes.json();

        const partsRes = await fetch('http://localhost:3000/api/parts');
        app.parts = await partsRes.json();

        partsCountEl.textContent = app.parts.length;
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// Procesar mensaje del usuario
async function processMessage(message) {
    const lowerMessage = message.toLowerCase();

    // Mostrar todos los repuestos
    if (lowerMessage.includes('mostrar todo') || lowerMessage.includes('ver todo') || lowerMessage.includes('todos los repuestos')) {
        let html = '<div>Todos los repuestos disponibles:</div>';
        app.parts.slice(0, 15).forEach(part => {
            html += createPartCard(part);
        });
        html += '<div style="margin-top: 15px;">Mostrando 15 repuestos. Usa la búsqueda para encontrar algo específico.</div>';
        return html;
    }

    // Mostrar categorías
    if (lowerMessage.includes('categoria') || lowerMessage.includes('categoría') || lowerMessage.includes('tipo') || lowerMessage === 'menu') {
        let msg = 'Categorías disponibles:\n\n';
        app.categories.forEach((cat, idx) => {
            msg += `${idx + 1}. ${cat.name}\n`;
        });
        msg += '\nEscribe el número o nombre de la categoría que te interesa.';
        app.conversationState.step = 'category_selection';
        return msg;
    }

    // Análisis de intención
    if (lowerMessage.includes('precio') || lowerMessage.includes('cuesta') || lowerMessage.includes('cuanto') || lowerMessage.includes('cuánto')) {
        return await handlePriceQuery(message);
    } else if (lowerMessage.includes('disponible') || lowerMessage.includes('stock') || lowerMessage.includes('hay')) {
        return await handleAvailabilityQuery(message);
    } else if (lowerMessage.includes('busco') || lowerMessage.includes('necesito') || lowerMessage.includes('quiero') || lowerMessage.includes('buscar')) {
        return await handleSearchQuery(message);
    } else {
        return await handleConversationalFlow(message);
    }
}

// Manejar consulta de precio
async function handlePriceQuery(message) {
    try {
        const response = await fetch('http://localhost:3000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message })
        });

        const parts = await response.json();

        if (parts.length > 0) {
            let html = '<div>Encontré estos repuestos con sus precios:</div>';
            parts.slice(0, 5).forEach(part => {
                html += createPartCard(part);
            });
            return html;
        } else {
            // Si no encuentra, mostrar repuestos populares
            let html = '<div>No encontré ese repuesto específico. Aquí hay algunos repuestos populares:</div>';
            app.parts.slice(0, 5).forEach(part => {
                html += createPartCard(part);
            });
            html += '<div style="margin-top: 15px;">Intenta buscar por nombre específico: filtro, bujía, cadena, batería, etc.</div>';
            return html;
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Hubo un error al buscar los precios. Por favor intenta de nuevo.';
    }
}

// Manejar consulta de disponibilidad
async function handleAvailabilityQuery(message) {
    try {
        const response = await fetch('http://localhost:3000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message })
        });

        const parts = await response.json();

        if (parts.length > 0) {
            let html = '<div>Disponibilidad de repuestos:</div>';
            parts.slice(0, 5).forEach(part => {
                const available = part.stock > 0;
                html += `
                    <div class="part-card" style="border-left-color: ${available ? '#27ae60' : '#e74c3c'}">
                        <div class="part-name">${part.name}</div>
                        <div class="part-stock" style="font-size: 14px; color: ${available ? '#27ae60' : '#e74c3c'};">
                            ${available ? `✓ Disponible (${part.stock} unidades)` : '✗ No disponible'}
                        </div>
                        <div class="part-price">$${formatPrice(part.price)}</div>
                    </div>
                `;
            });
            return html;
        } else {
            // Mostrar todos los repuestos disponibles
            let html = '<div>No encontré ese repuesto específico. Aquí hay repuestos disponibles en stock:</div>';
            app.parts.filter(p => p.stock > 0).slice(0, 5).forEach(part => {
                html += `
                    <div class="part-card" style="border-left-color: #27ae60">
                        <div class="part-name">${part.name}</div>
                        <div class="part-stock" style="font-size: 14px; color: #27ae60;">
                            ✓ Disponible (${part.stock} unidades)
                        </div>
                        <div class="part-price">$${formatPrice(part.price)}</div>
                    </div>
                `;
            });
            return html;
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Hubo un error al consultar la disponibilidad.';
    }
}

// Manejar búsqueda
async function handleSearchQuery(message) {
    try {
        // Extraer palabras clave del mensaje
        const keywords = ['filtro', 'bujia', 'cadena', 'llanta', 'amortiguador', 'bateria',
                         'pastilla', 'disco', 'piston', 'aceite', 'freno', 'motor',
                         'suspension', 'embrague', 'corona', 'piñon', 'espejo'];

        let searchTerm = message;

        // Si no encontramos keywords, buscar por categoría
        const categoryMatch = app.categories.find(c =>
            message.toLowerCase().includes(c.name.toLowerCase())
        );

        if (categoryMatch) {
            const response = await fetch(`http://localhost:3000/api/parts?categoryId=${categoryMatch.id}`);
            const parts = await response.json();

            if (parts.length > 0) {
                let html = `<div>Repuestos de ${categoryMatch.name}:</div>`;
                parts.slice(0, 10).forEach(part => {
                    html += createPartCard(part);
                });
                return html;
            }
        }

        // Búsqueda general
        const response = await fetch('http://localhost:3000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: searchTerm })
        });

        const parts = await response.json();

        if (parts.length > 0) {
            let html = '<div>Encontré estos repuestos que podrían interesarte:</div>';
            parts.slice(0, 8).forEach(part => {
                html += createPartCard(part);
            });
            return html;
        } else {
            // Si no hay resultados, mostrar categorías
            let msg = 'No encontré repuestos específicos. ¿Quieres explorar por categoría?\n\n';
            app.categories.forEach((cat, idx) => {
                msg += `${idx + 1}. ${cat.name}\n`;
            });
            msg += '\nEscribe el número o nombre de la categoría.';
            app.conversationState.step = 'category_selection';
            return msg;
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Hubo un error en la búsqueda. Por favor intenta de nuevo.';
    }
}

// Flujo conversacional guiado
async function handleConversationalFlow(message) {
    const lowerMessage = message.toLowerCase();

    // Manejar reinicio
    if (lowerMessage.includes('reiniciar') || lowerMessage.includes('empezar de nuevo') || lowerMessage.includes('comenzar')) {
        app.conversationState.step = 'greeting';
        return 'Chat reiniciado. ' + getBrandSelectionMessage();
    }

    // Manejar saludos
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas') || lowerMessage.includes('hey')) {
        if (app.conversationState.step === 'greeting') {
            app.conversationState.step = 'brand_selection';
            return getBrandSelectionMessage();
        }
    }

    // Manejar números
    const numberMatch = lowerMessage.match(/\b(\d+)\b/);
    if (numberMatch) {
        const number = parseInt(numberMatch[1]);

        if (app.conversationState.step === 'brand_selection' && number >= 1 && number <= app.brands.length) {
            const brand = app.brands[number - 1];
            app.conversationState.selectedBrand = brand;
            app.conversationState.step = 'model_selection';
            return await getModelSelectionMessage(brand);
        }

        if (app.conversationState.step === 'category_selection' && number >= 1 && number <= app.categories.length) {
            const category = app.categories[number - 1];
            app.conversationState.selectedCategory = category;
            return await getPartsByCategory(app.conversationState.selectedBrand.id, category.id);
        }
    }

    switch(app.conversationState.step) {
        case 'greeting':
            app.conversationState.step = 'brand_selection';
            return getBrandSelectionMessage();

        case 'brand_selection':
            const brand = findBrand(lowerMessage);
            if (brand) {
                app.conversationState.selectedBrand = brand;
                app.conversationState.step = 'model_selection';
                return await getModelSelectionMessage(brand);
            } else {
                return 'No reconozco esa marca. ' + getBrandSelectionMessage();
            }

        case 'model_selection':
            app.conversationState.step = 'category_selection';
            return getCategorySelectionMessage();

        case 'category_selection':
            const category = findCategory(lowerMessage);
            if (category) {
                app.conversationState.selectedCategory = category;
                return await getPartsByCategory(app.conversationState.selectedBrand.id, category.id);
            } else {
                return 'No reconozco esa categoría. ' + getCategorySelectionMessage();
            }

        default:
            // Intentar buscar en la base de datos
            return await handleSearchQuery(message);
    }
}

// Encontrar marca
function findBrand(message) {
    return app.brands.find(b => message.includes(b.name.toLowerCase()));
}

// Encontrar categoría
function findCategory(message) {
    return app.categories.find(c => message.includes(c.name.toLowerCase()));
}

// Mensajes del flujo
function getBrandSelectionMessage() {
    let msg = '¿Para qué marca de moto necesitas repuestos?\n\n';
    msg += 'Marcas disponibles:\n';
    app.brands.forEach((brand, idx) => {
        msg += `${idx + 1}. ${brand.name}\n`;
    });
    return msg;
}

async function getModelSelectionMessage(brand) {
    try {
        const response = await fetch(`http://localhost:3000/api/models/${brand.id}`);
        const models = await response.json();

        let msg = `Excelente, seleccionaste ${brand.name}. ¿Qué modelo tienes?\n\n`;
        models.forEach((model, idx) => {
            msg += `${idx + 1}. ${model.name}\n`;
        });
        return msg;
    } catch (error) {
        return 'Error al cargar los modelos.';
    }
}

function getCategorySelectionMessage() {
    let msg = '¿Qué tipo de repuesto necesitas?\n\n';
    app.categories.forEach((cat, idx) => {
        msg += `${idx + 1}. ${cat.name}\n`;
    });
    return msg;
}

async function getPartsByCategory(brandId, categoryId) {
    try {
        const response = await fetch(`http://localhost:3000/api/parts?brandId=${brandId}&categoryId=${categoryId}`);
        const parts = await response.json();

        if (parts.length > 0) {
            let html = `<div>Repuestos disponibles para ${app.conversationState.selectedBrand.name}:</div>`;
            parts.forEach(part => {
                html += createPartCard(part);
            });
            html += '<div style="margin-top: 15px;">¿Necesitas algo más?</div>';
            return html;
        } else {
            return 'No hay repuestos disponibles en esta categoría.';
        }
    } catch (error) {
        return 'Error al cargar los repuestos.';
    }
}

// Enviar mensaje
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage(message, true);
    userInput.value = '';

    showTyping();

    try {
        // Guardar en historial
        await saveToHistory(message, '');

        // Procesar mensaje
        setTimeout(async () => {
            const response = await processMessage(message);
            hideTyping();
            addMessage(response, false);

            // Actualizar historial con respuesta
            await saveToHistory(message, typeof response === 'string' ? response : 'Respuesta con contenido HTML');
        }, 500);
    } catch (error) {
        hideTyping();
        addMessage('Lo siento, hubo un error al procesar tu mensaje.', false);
    }
}

// Guardar en historial
async function saveToHistory(userMessage, botResponse) {
    try {
        await fetch('http://localhost:3000/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: app.sessionId,
                user_message: userMessage,
                bot_response: botResponse
            })
        });
    } catch (error) {
        console.error('Error guardando historial:', error);
    }
}

// Sugerencia rápida
function sendSuggestion(text) {
    userInput.value = text;
    sendMessage();
}

// Búsqueda rápida
function quickSearch(query) {
    userInput.value = query;
    sendMessage();
}

// Reiniciar chat
function resetChat() {
    app.conversationState = {
        step: 'greeting',
        selectedBrand: null,
        selectedModel: null,
        selectedCategory: null
    };
    chatMessages.innerHTML = '';
    addMessage('Chat reiniciado. ¿En qué puedo ayudarte?', false);
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Cerrar modales al hacer clic fuera o en X
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

// Inicializar aplicación Nivel 3
window.addEventListener('load', async () => {
    // Cargar sesión del usuario
    if (typeof loadSession === 'function') {
        loadSession();
    }

    // Cargar datos iniciales
    await loadInitialData();

    // Mostrar mensaje de bienvenida después de cargar datos
    setTimeout(() => {
        const userGreeting = auth && auth.user ? `¡Hola ${auth.user.username}!` : '¡Hola!';
        const welcomeMsg = `${userGreeting} 👋 Soy tu asistente de repuestos para motos colombianas.

🎉 Versión 3.0 - Nuevas funcionalidades:
✅ Sistema de autenticación completo
✅ Carrito de compras funcional
✅ Gestión de pedidos
✅ Lista de favoritos

Puedo ayudarte con:
• Ver catálogo completo: "mostrar todo"
• Consulta de precios: "¿Cuánto cuesta un filtro de aceite?"
• Disponibilidad: "¿Hay pastillas de freno?"
• Búsqueda directa: "Busco repuestos para motor"
• Flujo guiado: Escribe "hola" y te guiaré paso a paso

${!auth.user ? '💡 Inicia sesión para acceder al carrito y realizar pedidos!' : '🛒 Agrega productos al carrito haciendo clic en 🛒'}

¿Qué necesitas?`;

        // Remover mensaje de bienvenida estático si existe
        const welcomeDiv = document.querySelector('.welcome-message');
        if (welcomeDiv) {
            welcomeDiv.remove();
        }

        addMessage(welcomeMsg, false);
    }, 500);
});
