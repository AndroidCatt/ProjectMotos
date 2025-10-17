// App V6 - Integración de características avanzadas
// Nivel 6: IA, Voz, PDF, Gamificación, Comparación y más

// Inicializar motores avanzados
const aiEngine = new AIEngine();
const voiceAssistant = new VoiceAssistant();
const pdfExporter = new PDFExporter();
const chartSystem = new ChartSystem();
const productComparator = new ProductComparator();
const promotionSystem = new PromotionSystem();

// Variables globales
let isVoiceActive = false;
let tutorialStep = 0;

// ===== VOICE ASSISTANT =====
const voiceBtn = document.getElementById('voice-btn');

voiceBtn.addEventListener('click', () => {
    if (!isVoiceActive) {
        startVoiceChat();
    } else {
        stopVoiceChat();
    }
});

function startVoiceChat() {
    voiceAssistant.startListening();
    isVoiceActive = true;
    voiceBtn.style.background = 'rgba(244, 67, 54, 0.3)';
    voiceBtn.style.animation = 'pulse 1s infinite';
    showNotification('🎤 Escuchando... Habla ahora', 'info');

    // Agregar puntos por usar voz
    aiEngine.addPoints(5, 'Uso de chat por voz');
}

function stopVoiceChat() {
    voiceAssistant.stopListening();
    isVoiceActive = false;
    voiceBtn.style.background = '';
    voiceBtn.style.animation = '';
}

// Configurar callbacks del asistente de voz
voiceAssistant.onTranscript = (text, isFinal) => {
    if (isFinal) {
        userInput.value = text;
        sendMessage();
        stopVoiceChat();

        // Responder por voz
        setTimeout(() => {
            voiceAssistant.speak('Buscando tus repuestos');
        }, 500);
    } else {
        userInput.value = text; // Mostrar transcripción en tiempo real
    }
};

voiceAssistant.onError = (error) => {
    showNotification('❌ Error en reconocimiento de voz: ' + error, 'error');
    stopVoiceChat();
};

// ===== PDF EXPORT =====
const exportBtn = document.getElementById('export-btn');

exportBtn.addEventListener('click', () => {
    const exportMenu = `
        <div class="export-menu" style="position: absolute; right: 20px; top: 60px; background: white; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); padding: 10px; z-index: 1000;">
            <button onclick="exportCart()" class="export-option">📄 Exportar Carrito</button>
            <button onclick="exportFavorites()" class="export-option">❤️ Exportar Favoritos</button>
            <button onclick="exportQuote()" class="export-option">💰 Generar Cotización</button>
        </div>
    `;

    // Remover menú anterior si existe
    const oldMenu = document.querySelector('.export-menu');
    if (oldMenu) {
        oldMenu.remove();
        return;
    }

    document.body.insertAdjacentHTML('beforeend', exportMenu);

    // Cerrar al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!e.target.closest('.export-menu') && !e.target.closest('#export-btn')) {
                const menu = document.querySelector('.export-menu');
                if (menu) menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
});

async function exportCart() {
    if (bot.cart.length === 0) {
        showNotification('🛒 Tu carrito está vacío', 'info');
        return;
    }

    const total = bot.getTotalCart();
    const fileName = await pdfExporter.exportCart(bot.cart, total, {
        name: aiEngine.context.userProfile.name || 'Cliente',
        email: 'cliente@example.com',
        phone: '+57 300 123 4567'
    });

    showNotification(`✅ PDF generado: ${fileName}`, 'success');
    aiEngine.addPoints(10, 'Exportar carrito a PDF');
    document.querySelector('.export-menu')?.remove();
}

async function exportFavorites() {
    if (bot.favorites.length === 0) {
        showNotification('❤️ No tienes favoritos', 'info');
        return;
    }

    const fileName = await pdfExporter.exportFavorites(bot.favorites);
    showNotification(`✅ PDF generado: ${fileName}`, 'success');
    aiEngine.addPoints(10, 'Exportar favoritos a PDF');
    document.querySelector('.export-menu')?.remove();
}

async function exportQuote() {
    if (bot.cart.length === 0) {
        showNotification('🛒 Agrega productos al carrito primero', 'info');
        return;
    }

    const total = bot.getTotalCart();
    const fileName = await pdfExporter.exportCart(bot.cart, total, {
        name: prompt('Tu nombre:') || 'Cliente',
        email: prompt('Tu email:') || '',
        phone: prompt('Tu teléfono:') || ''
    });

    showNotification(`✅ Cotización generada: ${fileName}`, 'success');
    aiEngine.addPoints(15, 'Generar cotización');
    document.querySelector('.export-menu')?.remove();
}

// ===== PRODUCT COMPARISON =====
function addToComparison(product) {
    const result = productComparator.addToCompare(product);
    showNotification(result.message, result.success ? 'success' : 'info');

    if (result.success) {
        aiEngine.addPoints(3, 'Agregar a comparación');
        updateCompareButton();
    }
}

function updateCompareButton() {
    const count = productComparator.compareList.length;
    const helpBtn = document.getElementById('help-button');
    if (count > 0) {
        helpBtn.setAttribute('data-compare-count', count);
    } else {
        helpBtn.removeAttribute('data-compare-count');
    }
}

function openComparison() {
    if (productComparator.compareList.length < 2) {
        showNotification('⚖️ Agrega al menos 2 productos para comparar', 'info');
        return;
    }

    const comparison = productComparator.getComparisonData();
    const modal = document.getElementById('compare-modal');
    const content = document.getElementById('compare-content');

    content.innerHTML = `
        <div class="comparison-table">
            <table>
                <thead>
                    <tr>
                        <th>Característica</th>
                        ${comparison.products.map(p => `<th>${p.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Precio</td>
                        ${comparison.products.map(p => `<td class="price-cell">${bot.formatPrice(p.price)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Descuento</td>
                        ${comparison.products.map(p => `<td class="discount-cell">${p.discount}%</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Rating</td>
                        ${comparison.products.map(p => `<td class="rating-cell">${'⭐'.repeat(Math.floor(p.rating))} ${p.rating.toFixed(1)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Stock</td>
                        ${comparison.products.map(p => `<td class="stock-cell">${p.stock} unidades</td>`).join('')}
                    </tr>
                    <tr>
                        <td>Precio Final</td>
                        ${comparison.products.map(p => `<td class="final-price-cell"><strong>${bot.formatPrice(bot.calculateFinalPrice(p))}</strong></td>`).join('')}
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="winner-section">
            <h3>🏆 Mejor Opción</h3>
            <div class="winner-card">
                <h4>${comparison.winner.product.name}</h4>
                <p>Puntuación: ${comparison.winner.score.toFixed(1)}/100</p>
                <p>Esta opción ofrece la mejor relación calidad-precio basándose en todos los factores.</p>
                <button onclick="bot.addToCart(${JSON.stringify(comparison.winner.product).replace(/"/g, '&quot;')}); showNotification('✅ Agregado al carrito', 'success');" class="btn-primary">
                    🛒 Agregar al Carrito
                </button>
            </div>
        </div>

        <div class="comparison-chart">
            <canvas id="comparison-chart-canvas"></canvas>
        </div>

        <button onclick="productComparator.clearComparison(); closeModal('compare-modal'); showNotification('✅ Comparación limpiada', 'success');" class="btn-secondary">
            🗑️ Limpiar Comparación
        </button>
    `;

    modal.style.display = 'flex';

    // Crear gráfico
    setTimeout(() => {
        chartSystem.createPriceComparisonChart('comparison-chart-canvas', comparison.products);
    }, 100);

    aiEngine.addPoints(10, 'Ver comparación de productos');
}

// ===== STATS AND ACHIEVEMENTS =====
function openStats() {
    const stats = aiEngine.getUserStats();
    const modal = document.getElementById('stats-modal');
    const content = document.getElementById('stats-content');

    const achievements = [
        { id: 'first_search', name: 'Primera Búsqueda', icon: '🔍', unlocked: stats.searches > 0 },
        { id: 'shopper', name: 'Comprador Frecuente', icon: '🛒', unlocked: stats.purchaseHistory >= 10 },
        { id: 'comparator', name: 'Comparador Experto', icon: '⚖️', unlocked: false },
        { id: 'voice_user', name: 'Usuario de Voz', icon: '🎤', unlocked: false },
        { id: 'level_5', name: 'Nivel 5 Alcanzado', icon: '⭐', unlocked: stats.level >= 5 },
        { id: 'explorer', name: 'Explorador', icon: '🗺️', unlocked: stats.favoriteBrands.length >= 3 }
    ];

    content.innerHTML = `
        <div class="stats-container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${stats.level}</div>
                    <div class="stat-label">Nivel</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${stats.points}</div>
                    <div class="stat-label">Puntos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔍</div>
                    <div class="stat-value">${stats.searches}</div>
                    <div class="stat-label">Búsquedas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🏅</div>
                    <div class="stat-value">${stats.achievements}</div>
                    <div class="stat-label">Logros</div>
                </div>
            </div>

            <div class="progress-section">
                <h3>Progreso al Siguiente Nivel</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stats.points % 100)}%"></div>
                </div>
                <p>${stats.points % 100}/100 puntos</p>
            </div>

            <div class="achievements-section">
                <h3>🏆 Logros</h3>
                <div class="achievements-grid">
                    ${achievements.map(ach => `
                        <div class="achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">${ach.icon}</div>
                            <div class="achievement-name">${ach.name}</div>
                            <div class="achievement-status">${ach.unlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="favorite-brands">
                <h3>❤️ Marcas Favoritas</h3>
                <div class="brands-list">
                    ${stats.favoriteBrands.length > 0 ? stats.favoriteBrands.map(brand => `<span class="brand-badge">${brand}</span>`).join('') : '<p>Aún no tienes marcas favoritas</p>'}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

// ===== COUPONS AND PROMOTIONS =====
function openCoupons() {
    const modal = document.getElementById('coupons-modal');
    const content = document.getElementById('coupons-content');
    const promotions = promotionSystem.getAllPromotions();

    content.innerHTML = `
        <div class="coupons-container">
            <div class="coupon-input-section">
                <h3>¿Tienes un cupón?</h3>
                <div class="coupon-input-group">
                    <input type="text" id="coupon-code-input" placeholder="Ingresa tu código" />
                    <button onclick="applyCouponCode()" class="btn-primary">Aplicar</button>
                </div>
                <div id="coupon-result"></div>
            </div>

            <div class="promotions-list">
                <h3>🎟️ Promociones Activas</h3>
                ${promotions.map(promo => `
                    <div class="promo-card">
                        <div class="promo-header">
                            <span class="promo-code">${promo.code}</span>
                            <span class="promo-discount">${promo.type === 'percentage' ? promo.discount + '%' : promotionSystem.formatPrice(promo.discount)}</span>
                        </div>
                        <div class="promo-description">${promo.description}</div>
                        <div class="promo-footer">
                            <span class="promo-valid">Válido hasta: ${new Date(promo.validUntil).toLocaleDateString('es-CO')}</span>
                            ${promo.minPurchase ? `<span class="promo-min">Min: ${promotionSystem.formatPrice(promo.minPurchase)}</span>` : ''}
                        </div>
                        <button onclick="copyCode('${promo.code}')" class="btn-copy">📋 Copiar Código</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function applyCouponCode() {
    const code = document.getElementById('coupon-code-input').value;
    const total = bot.getTotalCart();
    const result = promotionSystem.applyCoupon(code, total);
    const resultDiv = document.getElementById('coupon-result');

    if (result.success) {
        resultDiv.innerHTML = `
            <div class="coupon-success">
                ✅ ¡Cupón aplicado!<br>
                Descuento: ${promotionSystem.formatPrice(result.discountAmount)}<br>
                Nuevo total: <strong>${promotionSystem.formatPrice(result.newTotal)}</strong>
            </div>
        `;
        showNotification('🎉 ¡Cupón aplicado con éxito!', 'success');
        aiEngine.addPoints(20, 'Aplicar cupón');
    } else {
        resultDiv.innerHTML = `<div class="coupon-error">❌ ${result.message}</div>`;
        showNotification(result.message, 'error');
    }
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showNotification(`📋 Código ${code} copiado`, 'success');
    });
}

// ===== TUTORIAL SYSTEM =====
function openTutorial() {
    const modal = document.getElementById('tutorial-modal');
    const content = document.getElementById('tutorial-content');

    const tutorials = [
        {
            title: '🔍 Búsqueda Inteligente',
            description: 'Usa la barra de búsqueda para encontrar repuestos rápidamente. El autocompletado te ayudará.',
            demo: 'search-demo.gif'
        },
        {
            title: '🎤 Chat por Voz',
            description: 'Haz clic en el micrófono y habla. El chatbot entenderá tu consulta y te responderá.',
            demo: 'voice-demo.gif'
        },
        {
            title: '⚖️ Comparar Productos',
            description: 'Agrega productos a comparación y visualiza una tabla detallada con el mejor ganador.',
            demo: 'compare-demo.gif'
        },
        {
            title: '💰 Cupones y Descuentos',
            description: 'Usa códigos promocionales para obtener descuentos en tu compra.',
            demo: 'coupon-demo.gif'
        },
        {
            title: '📄 Exportar PDF',
            description: 'Genera cotizaciones profesionales en PDF con todos tus productos.',
            demo: 'pdf-demo.gif'
        }
    ];

    content.innerHTML = `
        <div class="tutorial-container">
            <div class="tutorial-progress">
                <div class="tutorial-step active">1</div>
                <div class="tutorial-step">2</div>
                <div class="tutorial-step">3</div>
                <div class="tutorial-step">4</div>
                <div class="tutorial-step">5</div>
            </div>

            <div id="tutorial-slides" class="tutorial-slides">
                ${tutorials.map((tut, index) => `
                    <div class="tutorial-slide ${index === 0 ? 'active' : ''}" data-step="${index}">
                        <h3>${tut.title}</h3>
                        <p>${tut.description}</p>
                        <div class="tutorial-image-placeholder">
                            📱 Demo interactivo
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="tutorial-navigation">
                <button onclick="previousTutorialStep()" class="btn-secondary">← Anterior</button>
                <button onclick="nextTutorialStep()" class="btn-primary">Siguiente →</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    tutorialStep = 0;
}

function nextTutorialStep() {
    const slides = document.querySelectorAll('.tutorial-slide');
    const steps = document.querySelectorAll('.tutorial-step');

    if (tutorialStep < slides.length - 1) {
        slides[tutorialStep].classList.remove('active');
        steps[tutorialStep].classList.remove('active');
        tutorialStep++;
        slides[tutorialStep].classList.add('active');
        steps[tutorialStep].classList.add('active');
    } else {
        closeModal('tutorial-modal');
        showNotification('🎓 ¡Tutorial completado! +50 puntos', 'success');
        aiEngine.addPoints(50, 'Completar tutorial');
    }
}

function previousTutorialStep() {
    const slides = document.querySelectorAll('.tutorial-slide');
    const steps = document.querySelectorAll('.tutorial-step');

    if (tutorialStep > 0) {
        slides[tutorialStep].classList.remove('active');
        steps[tutorialStep].classList.remove('active');
        tutorialStep--;
        slides[tutorialStep].classList.add('active');
        steps[tutorialStep].classList.add('active');
    }
}

// ===== MODAL CONTROL =====
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Cerrar modal al hacer clic fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// ===== FAB MENU =====
const helpButton = document.getElementById('help-button');
const fabMenu = document.getElementById('fab-menu');

helpButton.addEventListener('click', () => {
    fabMenu.style.display = fabMenu.style.display === 'none' ? 'flex' : 'none';
});

// Cerrar FAB menu al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('#floating-help')) {
        fabMenu.style.display = 'none';
    }
});

// ===== USER LEVEL BADGE =====
function updateUserLevelBadge() {
    const stats = aiEngine.getUserStats();
    document.getElementById('user-level').textContent = stats.level;
    document.getElementById('user-points').textContent = stats.points;
}

// Actualizar badge cada segundo
setInterval(updateUserLevelBadge, 1000);

// ===== INITIALIZATION =====
window.addEventListener('load', () => {
    console.log('%c🎉 NIVEL 6 CARGADO!', 'color: #667eea; font-size: 24px; font-weight: bold;');
    console.log('%c✨ Nuevas características:', 'color: #764ba2; font-size: 16px;');
    console.log('  🧠 IA Conversacional Avanzada');
    console.log('  ⚖️ Comparación de Productos');
    console.log('  🎤 Chat por Voz');
    console.log('  📄 Exportación a PDF');
    console.log('  🎟️ Sistema de Cupones');
    console.log('  📊 Gráficos Interactivos');
    console.log('  🏆 Gamificación y Logros');
    console.log('  🎓 Tutorial Interactivo');

    // Inicializar badge de nivel
    updateUserLevelBadge();

    // Mostrar tutorial en primera visita
    if (!localStorage.getItem('tutorial_completed')) {
        setTimeout(() => {
            openTutorial();
        }, 2000);
    }

    // Agregar puntos por cargar la app
    aiEngine.addPoints(1, 'Abrir la aplicación');
});

console.log('%c🚀 App V6.0 Inicializada', 'color: #4caf50; font-size: 14px; font-weight: bold;');
