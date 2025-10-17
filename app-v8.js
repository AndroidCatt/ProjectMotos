// App V8.0 - Integración de PWA, Reviews, Admin Dashboard y Wishlist Share
// Conecta todas las funcionalidades del nivel 8 con la interfaz de usuario

// Inicializar sistemas del nivel 8
let reviewSystem;
let adminDashboard;
let wishlistShare;

// Detectar si estamos cargando una wishlist compartida
function checkSharedWishlist() {
    const urlParams = new URLSearchParams(window.location.search);
    const wishlistToken = urlParams.get('wishlist');

    if (wishlistToken && wishlistShare) {
        const result = wishlistShare.getWishlistByToken(wishlistToken);

        if (result.success) {
            showSharedWishlist(result.wishlist);
        } else {
            showNotification('Lista no encontrada o no disponible', 'error');
        }
    }
}

// Mostrar wishlist compartida
function showSharedWishlist(wishlist) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'shared-wishlist-modal';
    modal.style.display = 'block';

    let productsHTML = '';
    wishlist.products.forEach(product => {
        productsHTML += `
            <div class="wishlist-product-card">
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p class="brand">${product.brand}</p>
                    <p class="price">$${product.price.toLocaleString()}</p>
                    ${product.notes ? `<p class="notes">📝 ${product.notes}</p>` : ''}
                </div>
                <button class="btn-add-to-cart" onclick="addToCartFromWishlist('${product.id}')">
                    Agregar al Carrito
                </button>
            </div>
        `;
    });

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>🔗 ${wishlist.name}</h2>
                <button class="modal-close" onclick="closeModal('shared-wishlist-modal')">✕</button>
            </div>
            <div class="modal-body">
                <p class="wishlist-description">${wishlist.description}</p>
                <div class="wishlist-meta">
                    <span>📦 ${wishlist.products.length} productos</span>
                    <span>👁️ ${wishlist.views} vistas</span>
                    <span>📅 ${new Date(wishlist.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="wishlist-products">
                    ${productsHTML}
                </div>
                <div class="modal-actions">
                    <button class="btn-primary" onclick="importWishlistToFavorites('${wishlist.id}')">
                        Importar a Mis Favoritos
                    </button>
                    <button class="btn-secondary" onclick="closeModal('shared-wishlist-modal')">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Agregar producto desde wishlist al carrito
function addToCartFromWishlist(productId) {
    // Buscar producto en la base de datos
    const product = findProductById(productId);

    if (product) {
        addToCart(product);
        showNotification(`${product.name} agregado al carrito`, 'success');
    } else {
        showNotification('Producto no encontrado', 'error');
    }
}

// Buscar producto por ID
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

// Importar wishlist a favoritos
function importWishlistToFavorites(wishlistId) {
    if (!wishlistShare) return;

    const result = wishlistShare.getWishlistByToken(wishlistId);

    if (result.success) {
        const wishlist = result.wishlist;
        let imported = 0;

        wishlist.products.forEach(product => {
            const fullProduct = findProductById(product.id);
            if (fullProduct && !isInFavorites(fullProduct.id)) {
                toggleFavorite(fullProduct);
                imported++;
            }
        });

        showNotification(`${imported} productos importados a favoritos`, 'success');
        closeModal('shared-wishlist-modal');
    }
}

// ============================================
// REVIEWS - Mostrar y gestionar reviews
// ============================================

function showProductReviews(productId) {
    if (!reviewSystem) {
        showNotification('Sistema de reviews no disponible', 'error');
        return;
    }

    const reviews = reviewSystem.getProductReviews(productId);
    const stats = reviewSystem.getProductRatingStats(productId);

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'reviews-modal';
    modal.style.display = 'block';

    // Generar estrellas de rating
    const starsHTML = generateStarsHTML(stats.averageRating);

    // Generar distribución de ratings
    let distributionHTML = '';
    for (let star = 5; star >= 1; star--) {
        const count = stats.ratingDistribution[star];
        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews * 100) : 0;

        distributionHTML += `
            <div class="rating-bar">
                <span class="star-label">${star} ⭐</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="count">${count}</span>
            </div>
        `;
    }

    // Generar lista de reviews
    let reviewsHTML = '';
    if (reviews.length === 0) {
        reviewsHTML = '<p class="no-reviews">No hay reseñas todavía. ¡Sé el primero en dejar una!</p>';
    } else {
        reviews.forEach(review => {
            const reviewStars = generateStarsHTML(review.rating);
            const verifiedBadge = review.verified ? '<span class="verified-badge">✓ Compra verificada</span>' : '';

            reviewsHTML += `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-author">
                            <strong>${review.userName}</strong>
                            ${verifiedBadge}
                        </div>
                        <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="review-rating">${reviewStars}</div>
                    ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
                    <p class="review-comment">${review.comment}</p>
                    <div class="review-actions">
                        <button class="btn-helpful" onclick="markReviewHelpful('${review.id}', true)">
                            👍 Útil (${review.helpful})
                        </button>
                        <button class="btn-helpful" onclick="markReviewHelpful('${review.id}', false)">
                            👎 No útil (${review.notHelpful})
                        </button>
                        <button class="btn-report" onclick="reportReview('${review.id}')">⚠️ Reportar</button>
                    </div>
                    ${review.response ? `
                        <div class="vendor-response">
                            <strong>Respuesta del vendedor:</strong>
                            <p>${review.response.text}</p>
                            <small>${new Date(review.response.createdAt).toLocaleDateString()}</small>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    }

    modal.innerHTML = `
        <div class="modal-content modal-large">
            <div class="modal-header">
                <h2>⭐ Reseñas y Calificaciones</h2>
                <button class="modal-close" onclick="closeModal('reviews-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="reviews-summary">
                    <div class="overall-rating">
                        <div class="rating-number">${stats.averageRating}</div>
                        <div class="rating-stars">${starsHTML}</div>
                        <div class="rating-count">${stats.totalReviews} reseñas</div>
                        <div class="recommendation-rate">
                            ${stats.recommendationRate}% recomiendan este producto
                        </div>
                    </div>
                    <div class="rating-distribution">
                        ${distributionHTML}
                    </div>
                </div>

                <div class="reviews-actions">
                    <button class="btn-primary" onclick="openWriteReview('${productId}')">
                        ✍️ Escribir Reseña
                    </button>
                    <select id="review-filter" class="filter-select" onchange="filterReviews('${productId}')">
                        <option value="recent">Más recientes</option>
                        <option value="helpful">Más útiles</option>
                        <option value="rating_high">Mayor calificación</option>
                        <option value="rating_low">Menor calificación</option>
                    </select>
                </div>

                <div class="reviews-list">
                    ${reviewsHTML}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function generateStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '✨';
    stars += '☆'.repeat(emptyStars);

    return stars;
}

function markReviewHelpful(reviewId, helpful) {
    if (!reviewSystem) return;

    const user = window.authSystem?.getCurrentUser();
    const userId = user ? user.id : 'guest_' + Date.now();

    const result = reviewSystem.markHelpful(reviewId, userId, helpful);
    showNotification(result.message, result.success ? 'success' : 'warning');

    if (result.success) {
        // Actualizar UI sin recargar todo
        const btn = event.target;
        btn.textContent = helpful ? `👍 Útil (${result.helpful})` : `👎 No útil (${result.notHelpful})`;
    }
}

function reportReview(reviewId) {
    const reason = prompt('¿Por qué deseas reportar esta reseña?\n\n1. Spam\n2. Contenido inapropiado\n3. Información falsa\n4. Otro');

    if (reason) {
        const user = window.authSystem?.getCurrentUser();
        const userId = user ? user.id : 'guest';

        const result = reviewSystem.reportReview(reviewId, userId, reason);
        showNotification(result.message, result.success ? 'success' : 'error');
    }
}

function openWriteReview(productId) {
    const user = window.authSystem?.getCurrentUser();

    if (!user) {
        showNotification('Debes iniciar sesión para dejar una reseña', 'warning');
        openLoginModal();
        return;
    }

    closeModal('reviews-modal');

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'write-review-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>✍️ Escribir Reseña</h2>
                <button class="modal-close" onclick="closeModal('write-review-modal')">✕</button>
            </div>
            <div class="modal-body">
                <form id="review-form" class="review-form">
                    <div class="form-group">
                        <label>Calificación</label>
                        <div class="star-rating-input">
                            ${[5,4,3,2,1].map(n => `
                                <input type="radio" name="rating" value="${n}" id="star${n}" required>
                                <label for="star${n}">⭐</label>
                            `).join('')}
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="review-title">Título de la reseña (opcional)</label>
                        <input type="text" id="review-title" maxlength="100" placeholder="Ej: Excelente producto">
                    </div>

                    <div class="form-group">
                        <label for="review-comment">Comentario</label>
                        <textarea id="review-comment" rows="5" required minlength="10" maxlength="1000"
                            placeholder="Comparte tu experiencia con este producto..."></textarea>
                        <small>Mínimo 10 caracteres</small>
                    </div>

                    <button type="submit" class="btn-primary btn-full">Publicar Reseña</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Manejar envío del formulario
    document.getElementById('review-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const rating = parseInt(document.querySelector('input[name="rating"]:checked')?.value);
        const title = document.getElementById('review-title').value.trim();
        const comment = document.getElementById('review-comment').value.trim();

        if (!rating || !comment) {
            showNotification('Completa todos los campos requeridos', 'error');
            return;
        }

        const result = reviewSystem.submitReview({
            productId,
            userId: user.id,
            userName: user.fullName || user.username,
            rating,
            title,
            comment,
            verified: false // TODO: verificar si compró el producto
        });

        showNotification(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            closeModal('write-review-modal');
            showProductReviews(productId);
        }
    });
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function openAdminDashboard() {
    if (!adminDashboard) {
        adminDashboard = new AdminDashboard();
    }

    if (!adminDashboard.isAdmin) {
        showNotification('Acceso denegado. Solo para administradores.', 'error');
        return;
    }

    const dashboardHTML = adminDashboard.renderDashboard();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'admin-dashboard-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-fullscreen">
            <div class="modal-header">
                <h2>📊 Panel de Administración</h2>
                <button class="modal-close" onclick="closeModal('admin-dashboard-modal')">✕</button>
            </div>
            <div class="modal-body">
                ${dashboardHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// PWA - Notificaciones y funciones
// ============================================

function requestNotificationPermission() {
    if (!window.pwaSystem) {
        showNotification('Sistema PWA no disponible', 'error');
        return;
    }

    pwaSystem.requestNotificationPermission().then(permission => {
        if (permission === 'granted') {
            showNotification('¡Notificaciones activadas! 🔔', 'success');
        } else if (permission === 'denied') {
            showNotification('Notificaciones bloqueadas. Puedes activarlas en la configuración del navegador.', 'warning');
        }
    });
}

function showInstallPrompt() {
    if (window.pwaSystem && pwaSystem.deferredPrompt) {
        pwaSystem.installApp();
    } else {
        showNotification('La app ya está instalada o no está disponible para instalación', 'info');
    }
}

// ============================================
// WISHLIST - Compartir y gestionar
// ============================================

function openShareWishlist() {
    if (!wishlistShare) {
        wishlistShare = new WishlistShareSystem();
    }

    // Obtener wishlist por defecto del usuario
    const user = window.authSystem?.getCurrentUser();
    const wishlistId = 'default';

    const result = wishlistShare.shareWishlist(wishlistId, 'link');

    if (result.success) {
        showNotification(result.message, 'success');

        // Mostrar modal con opciones de compartir
        showShareOptions(result.url, wishlistId);
    } else {
        showNotification(result.message, 'error');
    }
}

function showShareOptions(url, wishlistId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'share-wishlist-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔗 Compartir Lista de Deseos</h2>
                <button class="modal-close" onclick="closeModal('share-wishlist-modal')">✕</button>
            </div>
            <div class="modal-body">
                <p>Comparte tu lista de deseos con amigos y familia:</p>

                <div class="share-url-box">
                    <input type="text" id="share-url-input" value="${url}" readonly>
                    <button class="btn-copy" onclick="copyShareURL('${url}')">📋 Copiar</button>
                </div>

                <div class="share-methods">
                    <button class="share-btn whatsapp" onclick="shareVia('${wishlistId}', 'whatsapp')">
                        💬 WhatsApp
                    </button>
                    <button class="share-btn email" onclick="shareVia('${wishlistId}', 'email')">
                        📧 Email
                    </button>
                    <button class="share-btn qr" onclick="shareVia('${wishlistId}', 'qr')">
                        📱 Código QR
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function copyShareURL(url) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showNotification('¡Link copiado al portapapeles!', 'success');
    }
}

function shareVia(wishlistId, method) {
    const result = wishlistShare.shareWishlist(wishlistId, method);

    if (method === 'qr' && result.success) {
        // Mostrar código QR
        const qrModal = document.createElement('div');
        qrModal.className = 'modal';
        qrModal.id = 'qr-modal';
        qrModal.style.display = 'block';

        qrModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📱 Código QR</h2>
                    <button class="modal-close" onclick="closeModal('qr-modal')">✕</button>
                </div>
                <div class="modal-body text-center">
                    <p>Escanea este código QR para ver la lista de deseos:</p>
                    <img src="${result.qrURL}" alt="QR Code" class="qr-code-image">
                </div>
            </div>
        `;

        document.body.appendChild(qrModal);
    }
}

// ============================================
// INICIALIZACIÓN DEL NIVEL 8
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[V8] Inicializando funcionalidades del nivel 8...');

    // Inicializar sistemas
    reviewSystem = new ReviewSystem();
    wishlistShare = new WishlistShareSystem();

    // Verificar si hay wishlist compartida en la URL
    checkSharedWishlist();

    // Agregar botón de admin en el dropdown de usuario (si es admin)
    const user = window.authSystem?.getCurrentUser();
    if (user && ['admin', 'demo'].includes(user.username)) {
        // Se agregará dinámicamente cuando se abra el dropdown
    }

    console.log('[V8] Nivel 8 inicializado correctamente');
});
