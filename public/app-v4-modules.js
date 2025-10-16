// ==================== MÓDULO V4.0 - FUNCIONALIDADES ADICIONALES ====================

// ==================== SISTEMA DE COMPARACIÓN DE PRODUCTOS ====================

function addToCompare(partId) {
    if (app.compareList.includes(partId)) {
        addMessage('Este producto ya está en tu lista de comparación', false);
        return;
    }

    if (app.compareList.length >= V4_CONFIG.MAX_COMPARE_ITEMS) {
        addMessage(`Solo puedes comparar hasta ${V4_CONFIG.MAX_COMPARE_ITEMS} productos a la vez`, false);
        return;
    }

    app.compareList.push(partId);
    updateCompareUI();
    addMessage(`✅ Producto agregado a comparación (${app.compareList.length}/${V4_CONFIG.MAX_COMPARE_ITEMS})`, false);

    if (app.compareList.length >= 2) {
        addMessage('💡 Tip: Escribe /comparar para ver la comparación', false);
    }
}

function removeFromCompare(partId) {
    app.compareList = app.compareList.filter(id => id !== partId);
    updateCompareUI();
}

function updateCompareUI() {
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
        if (app.compareList.length > 0) {
            compareBtn.style.display = 'inline-block';
            compareBtn.innerHTML = `⚖️ Comparar (${app.compareList.length})`;
        } else {
            compareBtn.style.display = 'none';
        }
    }
}

async function showComparison() {
    if (app.compareList.length < 2) {
        addMessage('Debes seleccionar al menos 2 productos para comparar', false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/parts/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ part_ids: app.compareList })
        });

        const products = await response.json();

        let html = `
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">⚖️ Comparación de Productos</div>
            <div style="overflow-x: auto;">
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Característica</th>
                            ${products.map(p => `<th>${p.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Imagen</strong></td>
                            ${products.map(p => `<td><img src="${p.image_url || 'https://via.placeholder.com/100'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;"></td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Marca</strong></td>
                            ${products.map(p => `<td>${p.brand_name}</td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Categoría</strong></td>
                            ${products.map(p => `<td>${p.category_name}</td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Precio</strong></td>
                            ${products.map(p => {
                                const discount = p.discount_percentage || 0;
                                const finalPrice = p.price * (1 - discount / 100);
                                return `<td><strong style="color: #27ae60;">$${formatPrice(finalPrice)}</strong>${discount > 0 ? `<br><small style="text-decoration: line-through; color: #999;">$${formatPrice(p.price)}</small><br><span style="color: #e74c3c;">-${discount}%</span>` : ''}</td>`;
                            }).join('')}
                        </tr>
                        <tr>
                            <td><strong>Calificación</strong></td>
                            ${products.map(p => `<td>${createStars(p.rating_average || 0)}<br><small>(${p.review_count || 0} opiniones)</small></td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Stock</strong></td>
                            ${products.map(p => `<td style="color: ${p.stock > 10 ? '#27ae60' : '#e74c3c'};">${p.stock} unidades</td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Descripción</strong></td>
                            ${products.map(p => `<td><small>${p.description || 'N/A'}</small></td>`).join('')}
                        </tr>
                        <tr>
                            <td><strong>Acciones</strong></td>
                            ${products.map(p => `
                                <td>
                                    <button onclick="addToCart(${p.id})" class="btn-sm btn-primary">🛒 Agregar</button>
                                    <button onclick="removeFromCompare(${p.id})" class="btn-sm btn-secondary">✖ Quitar</button>
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
            <button onclick="clearComparison()" class="btn-secondary" style="margin-top: 15px;">Limpiar comparación</button>
        `;

        addMessage(html, false);

        // Guardar en historial
        fetch('http://localhost:3000/api/comparisons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                part_ids: app.compareList,
                session_id: app.sessionId,
                user_id: auth.user?.id
            })
        });

    } catch (error) {
        console.error('Error en comparación:', error);
        addMessage('Error al comparar productos', false);
    }
}

function clearComparison() {
    app.compareList = [];
    updateCompareUI();
    addMessage('Comparación limpiada', false);
}

// ==================== AUTOCOMPLETADO DE BÚSQUEDA ====================

let autocompleteContainer = null;

function setupAutocomplete() {
    autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = 'autocomplete-suggestions';
    autocompleteContainer.className = 'autocomplete-container';
    autocompleteContainer.style.display = 'none';

    userInput.parentElement.appendChild(autocompleteContainer);

    userInput.addEventListener('input', debounce(handleAutocomplete, V4_CONFIG.AUTOCOMPLETE_DELAY));
    userInput.addEventListener('blur', () => {
        setTimeout(() => {
            autocompleteContainer.style.display = 'none';
        }, 200);
    });
}

async function handleAutocomplete(event) {
    const query = event.target.value.trim();

    if (query.length < 2 || query.startsWith('/')) {
        autocompleteContainer.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        const suggestions = await response.json();

        if (suggestions.length === 0) {
            autocompleteContainer.style.display = 'none';
            return;
        }

        let html = '';
        suggestions.forEach(suggestion => {
            html += `
                <div class="autocomplete-item" onclick="selectSuggestion('${suggestion.name.replace(/'/g, "\\'")}')">
                    <span>🔍 ${suggestion.name}</span>
                </div>
            `;
        });

        autocompleteContainer.innerHTML = html;
        autocompleteContainer.style.display = 'block';

    } catch (error) {
        console.error('Error en autocompletado:', error);
    }
}

function selectSuggestion(text) {
    userInput.value = text;
    autocompleteContainer.style.display = 'none';
    sendMessage();
}

// ==================== SISTEMA DE CUPONES ====================

async function showActiveCoupons() {
    try {
        const response = await fetch('http://localhost:3000/api/coupons/active');
        const coupons = await response.json();

        if (coupons.length === 0) {
            return 'No hay cupones disponibles en este momento';
        }

        let html = `
            <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">🎟️ Cupones Disponibles</div>
        `;

        coupons.forEach(coupon => {
            const discountText = coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}% OFF`
                : `$${formatPrice(coupon.discount_value)} OFF`;

            html += `
                <div class="coupon-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 20px; font-weight: 700; color: #e74c3c;">${discountText}</div>
                            <div style="font-size: 14px; margin: 5px 0;">${coupon.description}</div>
                            ${coupon.min_purchase > 0 ? `<div style="font-size: 12px; color: #7f8c8d;">Compra mínima: $${formatPrice(coupon.min_purchase)}</div>` : ''}
                        </div>
                        <div>
                            <div class="coupon-code">${coupon.code}</div>
                            <button onclick="copyCouponCode('${coupon.code}')" class="btn-sm btn-primary" style="margin-top: 5px;">Copiar código</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '<div style="margin-top: 10px; font-size: 13px; color: #7f8c8d;">💡 Los cupones se aplican automáticamente al finalizar la compra</div>';

        return html;

    } catch (error) {
        console.error('Error cargando cupones:', error);
        return 'Error al cargar cupones disponibles';
    }
}

function copyCouponCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        addMessage(`✅ Cupón "${code}" copiado al portapapeles`, false);
    }).catch(() => {
        addMessage(`Cupón: ${code}`, false);
    });
}

// ==================== PRODUCTOS RELACIONADOS Y RECOMENDACIONES ====================

async function showRelatedProducts(partId) {
    try {
        const response = await fetch(`http://localhost:3000/api/parts/${partId}/related`);
        const relatedParts = await response.json();

        if (relatedParts.length === 0) {
            return '';
        }

        let html = `
            <div style="font-size: 16px; font-weight: 600; margin: 20px 0 10px;">🔗 Productos Relacionados</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
        `;

        relatedParts.forEach(part => {
            html += createPartCardV3(part);
        });

        html += '</div>';

        return html;

    } catch (error) {
        console.error('Error cargando productos relacionados:', error);
        return '';
    }
}

async function showFeaturedProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/parts/featured');
        const parts = await response.json();

        let html = '<div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">⭐ Productos Destacados</div>';

        if (parts.length === 0) {
            return html + '<p>No hay productos destacados en este momento</p>';
        }

        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">';
        parts.forEach(part => {
            html += createPartCardV3(part);
        });
        html += '</div>';

        return html;

    } catch (error) {
        console.error('Error cargando productos destacados:', error);
        return 'Error al cargar productos destacados';
    }
}

async function showDeals() {
    try {
        const response = await fetch('http://localhost:3000/api/parts/deals');
        const parts = await response.json();

        let html = '<div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">🏷️ Productos en Oferta</div>';

        if (parts.length === 0) {
            return html + '<p>No hay ofertas disponibles en este momento</p>';
        }

        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">';
        parts.forEach(part => {
            html += createPartCardV3(part);
        });
        html += '</div>';

        return html;

    } catch (error) {
        console.error('Error cargando ofertas:', error);
        return 'Error al cargar ofertas';
    }
}

// ==================== TEMA OSCURO/CLARO ====================

function initTheme() {
    const savedTheme = loadFromStorage(V4_CONFIG.THEME_KEY, 'light');
    applyTheme(savedTheme);
}

function toggleTheme() {
    const newTheme = app.theme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
    saveToStorage(V4_CONFIG.THEME_KEY, newTheme);

    // Actualizar preferencias en el servidor si está autenticado
    if (auth.user) {
        fetch('http://localhost:3000/api/user/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ theme: newTheme })
        });
    }

    addMessage(`✨ Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : 'claro'}`, false);
}

function applyTheme(theme) {
    app.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        themeBtn.title = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
}

// ==================== COMANDOS RÁPIDOS ====================

function showQuickCommands() {
    let html = `
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">❓ Comandos Rápidos Disponibles</div>
        <div class="commands-grid">
    `;

    V4_CONFIG.QUICK_COMMANDS.forEach(cmd => {
        html += `
            <div class="command-card" onclick="executeCommand('${cmd.command}')">
                <div style="font-size: 24px; margin-bottom: 5px;">${cmd.icon}</div>
                <div style="font-weight: 600; margin-bottom: 3px;">${cmd.command}</div>
                <div style="font-size: 12px; color: #7f8c8d;">${cmd.description}</div>
            </div>
        `;
    });

    html += '</div>';

    return html;
}

async function executeCommand(command) {
    const lowerCmd = command.toLowerCase();

    switch (lowerCmd) {
        case '/ofertas':
            return await showDeals();
        case '/destacados':
            return await showFeaturedProducts();
        case '/cupones':
            return await showActiveCoupons();
        case '/comparar':
            await showComparison();
            return null;
        case '/ayuda':
            return showQuickCommands();
        case '/limpiar':
            resetChat();
            return null;
        default:
            return `Comando no reconocido: ${command}. Escribe /ayuda para ver la lista de comandos`;
    }
}

// ==================== ONBOARDING INTERACTIVO ====================

function checkOnboarding() {
    const completed = loadFromStorage(V4_CONFIG.ONBOARDING_KEY, false);

    if (!completed && !auth.user) {
        setTimeout(() => {
            startOnboarding();
        }, 2000);
    }
}

function startOnboarding() {
    const steps = [
        {
            title: '¡Bienvenido! 👋',
            message: 'Este es tu asistente de repuestos para motos. Te voy a mostrar cómo usarlo.',
            action: () => showOnboardingStep(1)
        },
        {
            title: 'Búsqueda Inteligente 🔍',
            message: 'Puedes buscar productos escribiendo su nombre. También tengo autocompletado para ayudarte.',
            action: () => showOnboardingStep(2)
        },
        {
            title: 'Comandos Rápidos ⚡',
            message: 'Usa comandos como /ofertas, /destacados, /cupones para acceder rápidamente a funciones.',
            action: () => showOnboardingStep(3)
        },
        {
            title: 'Comparar Productos ⚖️',
            message: 'Haz clic en el botón "Comparar" de los productos para compararlos lado a lado.',
            action: () => showOnboardingStep(4)
        },
        {
            title: '¡Listo! ✨',
            message: 'Ya estás listo para empezar. ¡Pregúntame lo que necesites!',
            action: () => completeOnboarding()
        }
    ];

    let currentStep = 0;

    function showOnboardingStep(step) {
        if (step < steps.length) {
            const stepData = steps[step];
            const html = `
                <div class="onboarding-card">
                    <h3>${stepData.title}</h3>
                    <p>${stepData.message}</p>
                    <button onclick="nextOnboardingStep()" class="btn-primary">
                        ${step < steps.length - 1 ? 'Siguiente' : 'Finalizar'}
                    </button>
                    <button onclick="skipOnboarding()" class="btn-secondary">Saltar tutorial</button>
                </div>
            `;
            addMessage(html, false);
            currentStep = step;
        }
    }

    window.nextOnboardingStep = () => {
        if (currentStep < steps.length - 1) {
            showOnboardingStep(currentStep + 1);
        } else {
            completeOnboarding();
        }
    };

    window.skipOnboarding = completeOnboarding;

    showOnboardingStep(0);
}

function completeOnboarding() {
    saveToStorage(V4_CONFIG.ONBOARDING_KEY, true);
    addMessage('✅ Tutorial completado. ¡Ahora puedes empezar a buscar repuestos!', false);
}

// ==================== EXPORTAR FUNCIONES GLOBALES ====================

window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;
window.showComparison = showComparison;
window.clearComparison = clearComparison;
window.selectSuggestion = selectSuggestion;
window.copyCouponCode = copyCouponCode;
window.toggleTheme = toggleTheme;
window.executeCommand = executeCommand;
