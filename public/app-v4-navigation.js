// ==================== MÓDULO DE NAVEGACIÓN MEJORADA V4.0 ====================

// Variables globales para paginación
let currentPage = {
    catalog: 6,
    search: 6,
    category: 6
};

// Función para mostrar más productos
window.showMoreProducts = function(type, currentCount) {
    const increment = 6;
    const newCount = currentCount + increment;

    let products = [];
    let messageText = '';

    switch(type) {
        case 'catalog':
            products = app.parts.slice(currentCount, newCount);
            messageText = '📦 Mostrando más productos...';
            break;
        case 'search':
            products = app.lastSearchResults.slice(currentCount, newCount);
            messageText = '🔍 Mostrando más resultados...';
            break;
        case 'category':
            products = app.lastCategoryResults.slice(currentCount, newCount);
            messageText = '📁 Mostrando más de esta categoría...';
            break;
    }

    if (products.length === 0) {
        addMessage('No hay más productos para mostrar', false);
        return;
    }

    let html = `<div style="font-size: 14px; font-weight: 600; margin-bottom: 10px;">${messageText}</div>`;

    products.forEach(part => {
        html += createPartCardV3(part);
    });

    // Agregar botón "Ver más" si quedan productos
    const totalProducts = type === 'catalog' ? app.parts.length :
                         type === 'search' ? app.lastSearchResults.length :
                         app.lastCategoryResults.length;

    if (newCount < totalProducts) {
        html += `
            <div style="text-align: center; margin: 20px 0;">
                <button onclick="showMoreProducts('${type}', ${newCount})" class="btn-primary">
                    Ver más productos (${totalProducts - newCount} restantes)
                </button>
            </div>
        `;
    } else {
        html += '<div style="text-align: center; margin: 20px 0; color: #7f8c8d; font-size: 13px;">✅ Has visto todos los productos</div>';
    }

    addMessage(html, false);
    currentPage[type] = newCount;
};

// Crear botones flotantes de navegación
function createFloatingButtons() {
    // Verificar si ya existen
    if (document.getElementById('scroll-top-btn')) {
        console.log('⚠️ Botones flotantes ya existen');
        return;
    }

    // Botón para ir arriba
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.id = 'scroll-top-btn';
    scrollTopBtn.className = 'floating-btn floating-top';
    scrollTopBtn.innerHTML = '⬆️';
    scrollTopBtn.title = 'Ir arriba';
    scrollTopBtn.onclick = scrollToTop;
    scrollTopBtn.style.display = 'none';

    // Botón para ir abajo
    const scrollBottomBtn = document.createElement('button');
    scrollBottomBtn.id = 'scroll-bottom-btn';
    scrollBottomBtn.className = 'floating-btn floating-bottom';
    scrollBottomBtn.innerHTML = '⬇️';
    scrollBottomBtn.title = 'Ir al final';
    scrollBottomBtn.onclick = scrollToBottom;
    scrollBottomBtn.style.display = 'none';

    // Botón de acciones rápidas
    const quickActionsBtn = document.createElement('button');
    quickActionsBtn.id = 'quick-actions-btn';
    quickActionsBtn.className = 'floating-btn floating-actions';
    quickActionsBtn.innerHTML = '⚡';
    quickActionsBtn.title = 'Acciones rápidas';
    quickActionsBtn.onclick = toggleQuickActionsMenu;

    document.body.appendChild(scrollTopBtn);
    document.body.appendChild(scrollBottomBtn);
    document.body.appendChild(quickActionsBtn);

    console.log('✅ Botones flotantes creados');

    // Función para actualizar botones
    function updateFloatingButtons() {
        const chatContainer = document.getElementById('chat-messages');
        if (!chatContainer) return;

        const scrollTop = chatContainer.scrollTop;
        const scrollHeight = chatContainer.scrollHeight;
        const clientHeight = chatContainer.clientHeight;

        // Mostrar botón arriba si no está en el top
        if (scrollTop > 200) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }

        // Mostrar botón abajo si no está en el bottom
        if (scrollTop < scrollHeight - clientHeight - 200) {
            scrollBottomBtn.style.display = 'flex';
        } else {
            scrollBottomBtn.style.display = 'none';
        }
    }

    // Esperar a que el chat container esté disponible
    const waitForChat = setInterval(() => {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
            clearInterval(waitForChat);
            chatContainer.addEventListener('scroll', updateFloatingButtons);
            // Actualizar al agregar nuevos mensajes
            const observer = new MutationObserver(updateFloatingButtons);
            observer.observe(chatContainer, { childList: true, subtree: true });
            console.log('✅ Event listeners de scroll configurados');
        }
    }, 100);
}

// Función para scroll suave arriba
function scrollToTop() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Función para scroll suave abajo (ya existe pero la mejoramos)
function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// Menú de acciones rápidas flotante
let quickActionsMenuVisible = false;

function toggleQuickActionsMenu() {
    if (quickActionsMenuVisible) {
        hideQuickActionsMenu();
    } else {
        showQuickActionsMenu();
    }
}

function showQuickActionsMenu() {
    // Crear menú si no existe
    let menu = document.getElementById('quick-actions-menu');
    if (!menu) {
        menu = document.createElement('div');
        menu.id = 'quick-actions-menu';
        menu.className = 'quick-actions-floating-menu';
        menu.innerHTML = `
            <div class="quick-menu-header">
                <span>⚡ Acciones Rápidas</span>
                <button onclick="hideQuickActionsMenu()" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">×</button>
            </div>
            <div class="quick-menu-items">
                <button onclick="executeQuickAction('/ofertas')" class="quick-menu-item">🏷️ Ver Ofertas</button>
                <button onclick="executeQuickAction('/cupones')" class="quick-menu-item">🎟️ Ver Cupones</button>
                <button onclick="executeQuickAction('/destacados')" class="quick-menu-item">⭐ Destacados</button>
                <button onclick="executeQuickAction('/comparar')" class="quick-menu-item">⚖️ Comparar</button>
                <button onclick="executeQuickAction('/ayuda')" class="quick-menu-item">❓ Ayuda</button>
                <button onclick="executeQuickAction('/limpiar')" class="quick-menu-item">🗑️ Limpiar Chat</button>
                <button onclick="scrollToTop()" class="quick-menu-item">⬆️ Ir Arriba</button>
                <button onclick="scrollToBottom()" class="quick-menu-item">⬇️ Ir Abajo</button>
            </div>
        `;
        document.body.appendChild(menu);
    }

    menu.classList.add('show');
    quickActionsMenuVisible = true;
}

window.hideQuickActionsMenu = function() {
    const menu = document.getElementById('quick-actions-menu');
    if (menu) {
        menu.classList.remove('show');
    }
    quickActionsMenuVisible = false;
};

window.executeQuickAction = async function(action) {
    hideQuickActionsMenu();

    if (action === '/limpiar') {
        resetChat();
        return;
    }

    // Simular que el usuario escribió el comando
    userInput.value = action;
    await sendMessage();
};

// Función para colapsar/expandir bloques grandes
window.toggleCollapse = function(id) {
    const content = document.getElementById(`collapsible-${id}`);
    const button = document.getElementById(`toggle-btn-${id}`);

    if (content.style.display === 'none') {
        content.style.display = 'block';
        button.textContent = '▼ Ocultar';
    } else {
        content.style.display = 'none';
        button.textContent = '▶ Mostrar';
    }
};

// Crear contenedor colapsable para bloques grandes
window.createCollapsibleSection = function(title, content, initiallyOpen = true) {
    const id = 'section-' + Date.now() + Math.random().toString(36).substr(2, 9);

    return `
        <div class="collapsible-section">
            <div class="collapsible-header">
                <span style="font-weight: 600; font-size: 16px;">${title}</span>
                <button id="toggle-btn-${id}" onclick="toggleCollapse('${id}')" class="btn-sm btn-secondary">
                    ${initiallyOpen ? '▼ Ocultar' : '▶ Mostrar'}
                </button>
            </div>
            <div id="collapsible-${id}" class="collapsible-content" style="display: ${initiallyOpen ? 'block' : 'none'};">
                ${content}
            </div>
        </div>
    `;
};

// Mejorar la búsqueda para limitar resultados
window.limitSearchResults = function(parts, maxInitial = 6) {
    // Guardar resultados completos
    app.lastSearchResults = parts;

    let html = '';

    // Mostrar solo los primeros
    const initialParts = parts.slice(0, maxInitial);
    initialParts.forEach(part => {
        html += createPartCardV3(part);
    });

    // Botón "Ver más" si hay más resultados
    if (parts.length > maxInitial) {
        html += `
            <div style="text-align: center; margin: 20px 0;">
                <button onclick="showMoreProducts('search', ${maxInitial})" class="btn-primary">
                    Ver más resultados (${parts.length - maxInitial} restantes)
                </button>
            </div>
        `;
    }

    return html;
};

// Función para resumen compacto de productos
window.createCompactProductList = function(parts, maxShow = 3) {
    let html = '<div class="compact-product-list">';

    parts.slice(0, maxShow).forEach(part => {
        const discount = part.discount_percentage || 0;
        const finalPrice = part.price * (1 - discount / 100);

        html += `
            <div class="compact-product-item">
                <img src="${part.image_url || 'https://via.placeholder.com/60'}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/60'">
                <div style="flex: 1; padding: 0 10px;">
                    <div style="font-weight: 600; font-size: 14px;">${part.name}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${part.brand_name} - ${part.category_name}</div>
                    <div style="font-weight: 700; color: #27ae60; font-size: 15px;">$${formatPrice(finalPrice)}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="addToCart(${part.id})" class="btn-sm btn-primary" title="Agregar al carrito">🛒</button>
                    <button onclick="addToCompare(${part.id})" class="btn-sm btn-secondary" title="Comparar">⚖️</button>
                </div>
            </div>
        `;
    });

    html += '</div>';

    if (parts.length > maxShow) {
        html += `<div style="text-align: center; margin-top: 10px; font-size: 13px; color: #7f8c8d;">Y ${parts.length - maxShow} productos más...</div>`;
    }

    return html;
};

// Inicializar navegación mejorada
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        createFloatingButtons();
        console.log('✅ Navegación mejorada inicializada (DOMContentLoaded)');
    });
} else {
    // DOM ya está listo
    createFloatingButtons();
    console.log('✅ Navegación mejorada inicializada (inmediato)');
}

// Exportar funciones globales
window.scrollToTop = scrollToTop;
window.scrollToBottom = scrollToBottom;
window.createFloatingButtons = createFloatingButtons;
