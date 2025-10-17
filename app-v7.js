// App Level 7 - Sistema de Autenticación y Checkout v7.0
// Integración completa de autenticación, checkout y gestión de pedidos

// ============================================
// INICIALIZACIÓN DE SISTEMAS
// ============================================

let authSystem;
let checkoutSystem;
let currentCheckoutStep = 1;
let checkoutData = {
    cart: [],
    shippingInfo: {},
    shippingMethod: null,
    paymentMethod: null,
    paymentData: {},
    couponCode: null
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    authSystem = new AuthSystem();
    checkoutSystem = new CheckoutSystem(authSystem);

    initAuthUI();
    initCheckoutUI();
    updateUserUI();
});

// ============================================
// INTERFAZ DE AUTENTICACIÓN
// ============================================

function initAuthUI() {
    // Botón de menú de usuario
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', () => {
            const isVisible = userDropdown.style.display === 'block';
            userDropdown.style.display = isVisible ? 'none' : 'block';
            updateUserDropdown();
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.style.display = 'none';
            }
        });
    }

    // Form de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Form de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

function updateUserUI() {
    const user = authSystem.getCurrentUser();
    const userMenuBtn = document.getElementById('user-menu-btn');

    if (user) {
        // Usuario logueado
        if (userMenuBtn) {
            userMenuBtn.innerHTML = '👤';
            userMenuBtn.title = user.fullName;
            userMenuBtn.classList.add('logged-in');
        }
    } else {
        // Usuario no logueado
        if (userMenuBtn) {
            userMenuBtn.innerHTML = '👤';
            userMenuBtn.title = 'Iniciar sesión';
            userMenuBtn.classList.remove('logged-in');
        }
    }
}

function updateUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    const user = authSystem.getCurrentUser();

    if (!user) {
        // Usuario no logueado
        userDropdown.innerHTML = `
            <div class="dropdown-section">
                <p class="dropdown-message">Inicia sesión para acceder a todas las funciones</p>
                <button class="dropdown-btn" onclick="openLoginModal()">🔐 Iniciar Sesión</button>
                <button class="dropdown-btn" onclick="openRegisterModal()">📝 Crear Cuenta</button>
            </div>
        `;
    } else {
        // Usuario logueado
        const orders = checkoutSystem.getUserOrders(user.id);
        userDropdown.innerHTML = `
            <div class="dropdown-section dropdown-user-info">
                <div class="user-avatar">👤</div>
                <div>
                    <strong>${user.fullName}</strong>
                    <p class="user-email">${user.email}</p>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">
                <button class="dropdown-btn" onclick="openProfileModal()">
                    <span>👤</span> Mi Perfil
                </button>
                <button class="dropdown-btn" onclick="openOrdersModal()">
                    <span>📦</span> Mis Pedidos ${orders.length > 0 ? `(${orders.length})` : ''}
                </button>
                <button class="dropdown-btn" onclick="openFavoritesModal()">
                    <span>❤️</span> Favoritos
                </button>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">
                <button class="dropdown-btn logout-btn" onclick="handleLogout()">
                    <span>🚪</span> Cerrar Sesión
                </button>
            </div>
        `;
    }
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value.trim();
    const password = form.password.value;

    const result = authSystem.login(username, password);

    if (result.success) {
        showNotification(result.message, 'success');
        closeModal('login-modal');
        updateUserUI();
        form.reset();

        // Si había un checkout pendiente, continuar
        if (checkoutData.cart.length > 0) {
            openCheckoutModal();
        }
    } else {
        showNotification(result.message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const form = e.target;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
    }

    const userData = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: password,
        fullName: form.fullName.value.trim(),
        phone: form.phone.value.trim()
    };

    const result = authSystem.register(userData);

    if (result.success) {
        showNotification(result.message, 'success');
        closeModal('register-modal');

        // Abrir modal de login
        setTimeout(() => {
            openLoginModal();
        }, 500);

        form.reset();
    } else {
        showNotification(result.message, 'error');
    }
}

function handleLogout() {
    const result = authSystem.logout();
    showNotification(result.message, 'success');
    updateUserUI();

    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.style.display = 'none';
    }
}

// ============================================
// MODALES DE AUTENTICACIÓN
// ============================================

function openLoginModal() {
    closeAllModals();
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function openRegisterModal() {
    closeAllModals();
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function openProfileModal() {
    const user = authSystem.getCurrentUser();
    if (!user) {
        openLoginModal();
        return;
    }

    closeAllModals();
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.style.display = 'flex';
        renderProfileContent('info');
    }

    // Event listeners para tabs de perfil
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderProfileContent(tab.dataset.tab);
        });
    });
}

function renderProfileContent(tab) {
    const user = authSystem.getCurrentUser();
    const content = document.getElementById('profile-content');

    if (tab === 'info') {
        content.innerHTML = `
            <form id="profile-info-form" class="profile-form">
                <div class="form-group">
                    <label>Nombre Completo</label>
                    <input type="text" name="fullName" value="${user.fullName}" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" value="${user.email}" disabled>
                    <small>El email no puede ser modificado</small>
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="phone" value="${user.phone || ''}" placeholder="+57 300 123 4567">
                </div>
                <button type="submit" class="btn-primary">Guardar Cambios</button>
            </form>
        `;

        document.getElementById('profile-info-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const updates = {
                fullName: form.fullName.value,
                phone: form.phone.value
            };
            const result = authSystem.updateProfile(user.id, updates);
            showNotification(result.message, result.success ? 'success' : 'error');
            if (result.success) {
                updateUserUI();
            }
        });
    } else if (tab === 'address') {
        content.innerHTML = `
            <form id="profile-address-form" class="profile-form">
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" name="street" value="${user.address?.street || ''}" placeholder="Calle 123 #45-67" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ciudad</label>
                        <input type="text" name="city" value="${user.address?.city || ''}" placeholder="Bogotá" required>
                    </div>
                    <div class="form-group">
                        <label>Departamento</label>
                        <input type="text" name="department" value="${user.address?.department || ''}" placeholder="Cundinamarca" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Código Postal</label>
                    <input type="text" name="zipCode" value="${user.address?.zipCode || ''}" placeholder="110111">
                </div>
                <button type="submit" class="btn-primary">Guardar Dirección</button>
            </form>
        `;

        document.getElementById('profile-address-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const address = {
                street: form.street.value,
                city: form.city.value,
                department: form.department.value,
                zipCode: form.zipCode.value
            };
            const result = authSystem.updateAddress(user.id, address);
            showNotification(result.message, result.success ? 'success' : 'error');
        });
    } else if (tab === 'security') {
        content.innerHTML = `
            <form id="profile-security-form" class="profile-form">
                <div class="form-group">
                    <label>Contraseña Actual</label>
                    <input type="password" name="currentPassword" required>
                </div>
                <div class="form-group">
                    <label>Nueva Contraseña</label>
                    <input type="password" name="newPassword" required>
                    <small>Mínimo 6 caracteres</small>
                </div>
                <div class="form-group">
                    <label>Confirmar Nueva Contraseña</label>
                    <input type="password" name="confirmPassword" required>
                </div>
                <button type="submit" class="btn-primary">Cambiar Contraseña</button>
            </form>
            <div class="security-info">
                <h4>Información de Seguridad</h4>
                <p>Última sesión: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-CO') : 'N/A'}</p>
                <p>Cuenta creada: ${new Date(user.createdAt).toLocaleDateString('es-CO')}</p>
            </div>
        `;

        document.getElementById('profile-security-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;

            if (form.newPassword.value !== form.confirmPassword.value) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }

            const result = authSystem.updatePassword(
                user.id,
                form.currentPassword.value,
                form.newPassword.value
            );
            showNotification(result.message, result.success ? 'success' : 'error');

            if (result.success) {
                form.reset();
            }
        });
    }
}

// ============================================
// SISTEMA DE CHECKOUT
// ============================================

function initCheckoutUI() {
    // Actualizar botón de carrito para que abra checkout
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        const oldClickHandler = cartBtn.onclick;
        cartBtn.onclick = () => {
            if (bot.cart.length > 0) {
                openCheckoutModal();
            } else {
                if (oldClickHandler) oldClickHandler();
            }
        };
    }
}

function openCheckoutModal() {
    // Verificar que el usuario esté logueado
    if (!authSystem.isLoggedIn()) {
        showNotification('Debes iniciar sesión para continuar con la compra', 'warning');
        openLoginModal();
        return;
    }

    // Verificar que hay productos en el carrito
    if (!bot.cart || bot.cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }

    closeAllModals();

    // Inicializar datos de checkout
    checkoutData.cart = JSON.parse(JSON.stringify(bot.cart));
    currentCheckoutStep = 1;

    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'flex';
        renderCheckoutStep(1);
    }
}

function renderCheckoutStep(step) {
    currentCheckoutStep = step;

    // Actualizar indicadores de paso
    document.querySelectorAll('.checkout-steps .step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.dataset.step);
        if (stepNum < step) {
            stepEl.classList.add('completed');
            stepEl.classList.remove('active');
        } else if (stepNum === step) {
            stepEl.classList.add('active');
            stepEl.classList.remove('completed');
        } else {
            stepEl.classList.remove('active', 'completed');
        }
    });

    const content = document.getElementById('checkout-content');

    if (step === 1) {
        renderShippingStep(content);
    } else if (step === 2) {
        renderPaymentStep(content);
    } else if (step === 3) {
        renderConfirmationStep(content);
    }
}

function renderShippingStep(content) {
    const user = authSystem.getCurrentUser();
    const shippingMethods = checkoutSystem.getShippingMethods();

    content.innerHTML = `
        <div class="checkout-step-content">
            <h3>📍 Información de Envío</h3>
            <form id="shipping-form" class="checkout-form">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" name="fullName" value="${user.fullName}" required>
                    </div>
                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" name="phone" value="${user.phone || ''}" placeholder="+57 300 123 4567" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Dirección *</label>
                    <input type="text" name="address" value="${user.address?.street || ''}" placeholder="Calle 123 #45-67" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Ciudad *</label>
                        <input type="text" name="city" value="${user.address?.city || ''}" placeholder="Bogotá" required>
                    </div>
                    <div class="form-group">
                        <label>Departamento *</label>
                        <input type="text" name="department" value="${user.address?.department || ''}" placeholder="Cundinamarca" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Código Postal</label>
                    <input type="text" name="zipCode" value="${user.address?.zipCode || ''}" placeholder="110111">
                </div>

                <h4>🚚 Método de Envío</h4>
                <div class="shipping-methods">
                    ${shippingMethods.map(method => `
                        <label class="shipping-method-card">
                            <input type="radio" name="shippingMethod" value="${method.id}" ${method.id === 'standard' ? 'checked' : ''} required>
                            <div class="method-info">
                                <div class="method-header">
                                    <span class="method-icon">${method.icon}</span>
                                    <span class="method-name">${method.name}</span>
                                    <span class="method-price">${checkoutSystem.formatPrice(method.price)}</span>
                                </div>
                                <div class="method-description">${method.description}</div>
                                <div class="method-time">⏱️ ${method.estimatedDays} días</div>
                            </div>
                        </label>
                    `).join('')}
                </div>

                <div class="checkout-actions">
                    <button type="button" class="btn-secondary" onclick="closeModal('checkout-modal')">Cancelar</button>
                    <button type="submit" class="btn-primary">Continuar al Pago →</button>
                </div>
            </form>
        </div>
    `;

    document.getElementById('shipping-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target;

        checkoutData.shippingInfo = {
            fullName: form.fullName.value,
            phone: form.phone.value,
            address: form.address.value,
            city: form.city.value,
            department: form.department.value,
            zipCode: form.zipCode.value
        };
        checkoutData.shippingMethod = form.shippingMethod.value;

        renderCheckoutStep(2);
    });
}

function renderPaymentStep(content) {
    const paymentMethods = checkoutSystem.getPaymentMethods();
    const totals = checkoutSystem.calculateOrderTotals(
        checkoutData.cart,
        checkoutData.shippingMethod,
        checkoutData.couponCode
    );

    content.innerHTML = `
        <div class="checkout-step-content">
            <h3>💳 Método de Pago</h3>

            <div class="payment-methods-grid">
                ${paymentMethods.map(method => `
                    <label class="payment-method-card">
                        <input type="radio" name="paymentMethod" value="${method.id}" ${method.id === 'credit-card' ? 'checked' : ''}>
                        <div class="payment-method-info">
                            <span class="payment-icon">${method.icon}</span>
                            <span class="payment-name">${method.name}</span>
                        </div>
                        <small>${method.description}</small>
                    </label>
                `).join('')}
            </div>

            <div id="payment-form-container">
                <!-- Formulario específico según método seleccionado -->
            </div>

            <div class="order-summary">
                <h4>Resumen del Pedido</h4>
                <div class="summary-line">
                    <span>Subtotal:</span>
                    <span>${checkoutSystem.formatPrice(totals.subtotal)}</span>
                </div>
                <div class="summary-line discount">
                    <span>Descuentos:</span>
                    <span>-${checkoutSystem.formatPrice(totals.discount)}</span>
                </div>
                <div class="summary-line">
                    <span>Envío:</span>
                    <span>${checkoutSystem.formatPrice(totals.shippingCost)}</span>
                </div>
                ${totals.couponDiscount > 0 ? `
                    <div class="summary-line discount">
                        <span>Cupón aplicado:</span>
                        <span>-${checkoutSystem.formatPrice(totals.couponDiscount)}</span>
                    </div>
                ` : ''}
                <div class="summary-line total">
                    <span>Total:</span>
                    <span>${checkoutSystem.formatPrice(totals.total)}</span>
                </div>
            </div>

            <div class="checkout-actions">
                <button type="button" class="btn-secondary" onclick="renderCheckoutStep(1)">← Volver</button>
                <button type="button" class="btn-primary" onclick="proceedToConfirmation()">Continuar →</button>
            </div>
        </div>
    `;

    // Event listener para cambio de método de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            checkoutData.paymentMethod = radio.value;
            renderPaymentForm(radio.value);
        });
    });

    // Renderizar formulario inicial
    checkoutData.paymentMethod = 'credit-card';
    renderPaymentForm('credit-card');
}

function renderPaymentForm(methodId) {
    const container = document.getElementById('payment-form-container');

    if (methodId === 'credit-card' || methodId === 'debit-card') {
        container.innerHTML = `
            <form id="payment-form" class="payment-form">
                <h4>Información de la Tarjeta</h4>
                <div class="form-group">
                    <label>Número de Tarjeta</label>
                    <input type="text" name="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Fecha de Expiración</label>
                        <input type="text" name="expiryDate" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group">
                        <label>CVV</label>
                        <input type="text" name="cvv" placeholder="123" maxlength="4" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nombre en la Tarjeta</label>
                    <input type="text" name="cardholderName" placeholder="JUAN PEREZ" required>
                </div>
            </form>
        `;
    } else if (methodId === 'pse') {
        const banks = checkoutSystem.getPSEBanks();
        container.innerHTML = `
            <form id="payment-form" class="payment-form">
                <h4>Información PSE</h4>
                <div class="form-group">
                    <label>Banco</label>
                    <select name="bank" required>
                        <option value="">Selecciona tu banco</option>
                        ${banks.map(bank => `<option value="${bank.id}">${bank.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Cuenta</label>
                    <select name="accountType" required>
                        <option value="savings">Ahorros</option>
                        <option value="checking">Corriente</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tipo de Documento</label>
                        <select name="documentType" required>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="CE">Cédula de Extranjería</option>
                            <option value="NIT">NIT</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Número de Documento</label>
                        <input type="text" name="documentNumber" required>
                    </div>
                </div>
            </form>
        `;
    } else if (methodId === 'nequi' || methodId === 'daviplata') {
        container.innerHTML = `
            <form id="payment-form" class="payment-form">
                <h4>Información de ${methodId === 'nequi' ? 'Nequi' : 'Daviplata'}</h4>
                <div class="form-group">
                    <label>Número de Celular</label>
                    <input type="tel" name="phoneNumber" placeholder="3001234567" maxlength="10" required>
                </div>
            </form>
        `;
    } else if (methodId === 'cash') {
        container.innerHTML = `
            <div class="payment-info">
                <p>💵 Pagarás en efectivo al recibir tu pedido.</p>
                <p><strong>Nota:</strong> Se aplicará un cargo de ${checkoutSystem.formatPrice(5000)} por manejo de efectivo.</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="payment-info">
                <p>Serás redirigido para completar el pago.</p>
            </div>
        `;
    }
}

function proceedToConfirmation() {
    const paymentForm = document.getElementById('payment-form');

    if (paymentForm) {
        if (!paymentForm.checkValidity()) {
            paymentForm.reportValidity();
            return;
        }

        const formData = new FormData(paymentForm);
        checkoutData.paymentData = {};
        for (let [key, value] of formData.entries()) {
            checkoutData.paymentData[key] = value;
        }
    }

    renderCheckoutStep(3);
}

function renderConfirmationStep(content) {
    const totals = checkoutSystem.calculateOrderTotals(
        checkoutData.cart,
        checkoutData.shippingMethod,
        checkoutData.couponCode
    );
    const shippingMethod = checkoutSystem.getShippingMethod(checkoutData.shippingMethod);
    const paymentMethod = checkoutSystem.getPaymentMethod(checkoutData.paymentMethod);

    content.innerHTML = `
        <div class="checkout-step-content">
            <h3>✅ Confirmar Pedido</h3>

            <div class="confirmation-section">
                <h4>📍 Dirección de Envío</h4>
                <p><strong>${checkoutData.shippingInfo.fullName}</strong></p>
                <p>${checkoutData.shippingInfo.address}</p>
                <p>${checkoutData.shippingInfo.city}, ${checkoutData.shippingInfo.department}</p>
                <p>📞 ${checkoutData.shippingInfo.phone}</p>
            </div>

            <div class="confirmation-section">
                <h4>🚚 Método de Envío</h4>
                <p>${shippingMethod.icon} ${shippingMethod.name} - ${checkoutSystem.formatPrice(shippingMethod.price)}</p>
                <p><small>${shippingMethod.description}</small></p>
            </div>

            <div class="confirmation-section">
                <h4>💳 Método de Pago</h4>
                <p>${paymentMethod.icon} ${paymentMethod.name}</p>
            </div>

            <div class="confirmation-section">
                <h4>🛒 Productos (${checkoutData.cart.length})</h4>
                <div class="confirmation-items">
                    ${checkoutData.cart.map(item => `
                        <div class="confirmation-item">
                            <span class="item-icon">${item.image}</span>
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-meta">${item.brand} - Cantidad: ${item.quantity}</div>
                            </div>
                            <div class="item-price">${checkoutSystem.formatPrice(item.price * item.quantity * (1 - item.discount / 100))}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="confirmation-total">
                <h4>Total a Pagar</h4>
                <div class="total-amount">${checkoutSystem.formatPrice(totals.total)}</div>
                <p class="total-savings">Ahorras: ${checkoutSystem.formatPrice(totals.savings)}</p>
            </div>

            <div class="checkout-actions">
                <button type="button" class="btn-secondary" onclick="renderCheckoutStep(2)">← Volver</button>
                <button type="button" class="btn-primary btn-large" onclick="processCheckout()" id="confirm-order-btn">
                    Confirmar y Pagar
                </button>
            </div>
        </div>
    `;
}

async function processCheckout() {
    const btn = document.getElementById('confirm-order-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Procesando...';
    }

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await checkoutSystem.processPayment(checkoutData);

    if (result.success) {
        // Limpiar carrito
        bot.cart = [];
        bot.saveCart();
        updateCartBadge();

        // Mostrar confirmación
        showOrderConfirmation(result.order);

        // Cerrar modal de checkout
        closeModal('checkout-modal');

        // Resetear datos de checkout
        checkoutData = {
            cart: [],
            shippingInfo: {},
            shippingMethod: null,
            paymentMethod: null,
            paymentData: {},
            couponCode: null
        };
    } else {
        showNotification(result.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Confirmar y Pagar';
        }
    }
}

function showOrderConfirmation(order) {
    const modal = document.getElementById('order-confirmation-modal');
    const content = document.getElementById('order-confirmation-content');

    content.innerHTML = `
        <div class="order-confirmation-details">
            <p class="order-number">Pedido #${order.id}</p>
            <p class="order-total">Total: ${checkoutSystem.formatPrice(order.pricing.total)}</p>
            <p class="order-message">
                ¡Gracias por tu compra! Recibirás un correo de confirmación con los detalles de tu pedido.
            </p>
            <div class="order-tracking">
                <p><strong>Número de Seguimiento:</strong></p>
                <p class="tracking-number">${order.shipping.trackingNumber}</p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    // Guardar último pedido para viewOrderDetails
    window.lastOrderId = order.id;
}

function viewOrderDetails() {
    closeModal('order-confirmation-modal');
    if (window.lastOrderId) {
        openOrderDetailModal(window.lastOrderId);
    }
}

// ============================================
// MODAL DE PEDIDOS
// ============================================

function openOrdersModal() {
    const user = authSystem.getCurrentUser();
    if (!user) {
        openLoginModal();
        return;
    }

    closeAllModals();
    const modal = document.getElementById('orders-modal');
    const content = document.getElementById('orders-content');

    const orders = checkoutSystem.getUserOrders(user.id);

    if (orders.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>No tienes pedidos aún</h3>
                <p>Cuando realices tu primera compra, aparecerá aquí.</p>
                <button class="btn-primary" onclick="closeModal('orders-modal')">Comenzar a Comprar</button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="orders-list">
                ${orders.map(order => `
                    <div class="order-card" onclick="openOrderDetailModal('${order.id}')">
                        <div class="order-header">
                            <div>
                                <strong>Pedido #${order.id}</strong>
                                <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span>
                            </div>
                            <div class="order-date">${new Date(order.createdAt).toLocaleDateString('es-CO')}</div>
                        </div>
                        <div class="order-body">
                            <p>${order.items.length} producto${order.items.length > 1 ? 's' : ''}</p>
                            <p class="order-total">${checkoutSystem.formatPrice(order.pricing.total)}</p>
                        </div>
                        <div class="order-footer">
                            <span>🚚 ${order.shipping.trackingNumber}</span>
                            <span>→</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    modal.style.display = 'flex';
}

function openOrderDetailModal(orderId) {
    const order = checkoutSystem.getOrder(orderId);
    if (!order) return;

    closeAllModals();
    const modal = document.getElementById('order-detail-modal');
    const content = document.getElementById('order-detail-content');

    content.innerHTML = `
        <div class="order-detail">
            <div class="order-detail-header">
                <div>
                    <h3>Pedido #${order.id}</h3>
                    <span class="order-status status-${order.status}">${getStatusLabel(order.status)}</span>
                </div>
                <div class="order-detail-date">
                    ${new Date(order.createdAt).toLocaleString('es-CO')}
                </div>
            </div>

            <div class="order-timeline">
                <h4>📍 Estado del Pedido</h4>
                <div class="timeline">
                    ${order.timeline.map(event => `
                        <div class="timeline-item">
                            <div class="timeline-dot"></div>
                            <div class="timeline-content">
                                <strong>${event.message}</strong>
                                <small>${new Date(event.timestamp).toLocaleString('es-CO')}</small>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="order-info-grid">
                <div class="order-info-section">
                    <h4>📦 Productos</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.image}</span>
                            <div>
                                <div>${item.name}</div>
                                <small>${item.brand} x${item.quantity}</small>
                            </div>
                            <div>${checkoutSystem.formatPrice(item.finalPrice * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-info-section">
                    <h4>📍 Envío</h4>
                    <p><strong>${order.customer.fullName}</strong></p>
                    <p>${order.customer.address}</p>
                    <p>${order.customer.city}, ${order.customer.department}</p>
                    <p>📞 ${order.customer.phone}</p>
                    <p><strong>Tracking:</strong> ${order.shipping.trackingNumber}</p>
                </div>

                <div class="order-info-section">
                    <h4>💰 Resumen</h4>
                    <div class="order-pricing">
                        <div><span>Subtotal:</span><span>${checkoutSystem.formatPrice(order.pricing.subtotal)}</span></div>
                        <div><span>Descuentos:</span><span>-${checkoutSystem.formatPrice(order.pricing.discount)}</span></div>
                        <div><span>Envío:</span><span>${checkoutSystem.formatPrice(order.pricing.shippingCost)}</span></div>
                        <div class="total"><span>Total:</span><span>${checkoutSystem.formatPrice(order.pricing.total)}</span></div>
                    </div>
                </div>
            </div>

            ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                <div class="order-actions">
                    <button class="btn-secondary" onclick="cancelOrderConfirm('${order.id}')">Cancelar Pedido</button>
                </div>
            ` : ''}
        </div>
    `;

    modal.style.display = 'flex';
}

function cancelOrderConfirm(orderId) {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        const result = checkoutSystem.cancelOrder(orderId, 'Cancelado por el cliente');
        if (result.success) {
            showNotification('Pedido cancelado exitosamente', 'success');
            closeModal('order-detail-modal');
            openOrdersModal();
        } else {
            showNotification(result.message, 'error');
        }
    }
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pendiente',
        'confirmed': 'Confirmado',
        'processing': 'En Preparación',
        'shipped': 'Enviado',
        'in-transit': 'En Tránsito',
        'out-for-delivery': 'En Reparto',
        'delivered': 'Entregado',
        'cancelled': 'Cancelado'
    };
    return labels[status] || status;
}

// ============================================
// UTILIDADES
// ============================================

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function openFavoritesModal() {
    // Reusar función existente del nivel anterior
    if (typeof openFavorites === 'function') {
        openFavorites();
    }
}

function updateCartBadge() {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn && bot.cart) {
        const totalItems = bot.cart.reduce((sum, item) => sum + item.quantity, 0);

        let badge = cartBtn.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartBtn.appendChild(badge);
        }

        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Inicializar badge al cargar
if (typeof bot !== 'undefined') {
    updateCartBadge();
}
