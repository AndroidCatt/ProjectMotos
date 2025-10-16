// Funciones de autenticación y sesión
const auth = {
    user: null,
    token: null
};

// Cargar sesión desde localStorage
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

// Actualizar UI del usuario
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

// Mostrar modal de autenticación
function showAuthModal() {
    document.getElementById('auth-modal').style.display = 'block';
}

// Mostrar formulario de login
function showLogin() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
}

// Mostrar formulario de registro
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'flex';
}

// Login
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
            addMessage('✅ ¡Bienvenido ' + data.user.username + '! Ahora puedes agregar productos al carrito y hacer pedidos.', false);
        } else {
            addMessage('❌ Error: ' + data.error, false);
        }
    } catch (error) {
        addMessage('❌ Error al iniciar sesión', false);
        console.error(error);
    }
}

// Registro
async function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const full_name = document.getElementById('reg-fullname').value;
    const phone = document.getElementById('reg-phone').value;
    const address = document.getElementById('reg-address').value;

    if (!username || !email || !password) {
        addMessage('Por favor completa los campos requeridos (usuario, email, contraseña)', false);
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

// Logout
function logout() {
    auth.token = null;
    auth.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUserUI();
    document.getElementById('cart-count').textContent = '0';
    addMessage('Sesión cerrada exitosamente', false);
}

// Cargar contador del carrito
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
        console.error('Error cargando carrito:', error);
    }
}

// Agregar al carrito
async function addToCart(partId) {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para agregar productos al carrito', false);
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
        } else {
            addMessage('❌ Error al agregar al carrito', false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al agregar al carrito', false);
    }
}

// Ver carrito
async function viewCart() {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para ver tu carrito', false);
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

// Mostrar carrito
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

// Actualizar cantidad
async function updateCartQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(cartId);
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            viewCart();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Eliminar del carrito
async function removeFromCart(cartId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        });

        if (response.ok) {
            viewCart();
            loadCartCount();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Realizar pedido
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
            addMessage(`✅ ¡Pedido realizado exitosamente! #${data.order_id} - Total: $${formatPrice(data.total)}`, false);
            loadCartCount();
        } else {
            const error = await response.json();
            addMessage('❌ Error: ' + error.error, false);
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('❌ Error al realizar el pedido', false);
    }
}

function closeCartModal() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Ver pedidos
async function viewOrders() {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para ver tus pedidos', false);
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
        ordersContent.innerHTML = '<p class="message-info">No tienes pedidos aún</p>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        html += `
            <div class="order-item">
                <div class="order-header">
                    <div class="order-id">Pedido #${order.id}</div>
                    <div class="order-status ${order.status}">${order.status === 'pending' ? 'Pendiente' : order.status}</div>
                </div>
                <p>📅 Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}</p>
                <p>📍 Dirección: ${order.delivery_address}</p>
                ${order.notes ? `<p>📝 Notas: ${order.notes}</p>` : ''}
                <div class="order-total">Total: $${formatPrice(order.total)}</div>
            </div>
        `;
    });

    ordersContent.innerHTML = html;
}

function closeOrdersModal() {
    document.getElementById('orders-modal').style.display = 'none';
}

// Favoritos
async function addToFavorites(partId) {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para agregar a favoritos', false);
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ part_id: partId })
        });

        if (response.ok) {
            addMessage('❤️ Agregado a favoritos', false);
        } else {
            const data = await response.json();
            addMessage('⚠️ ' + data.error, false);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function viewFavorites() {
    if (!auth.token) {
        showAuthModal();
        addMessage('⚠️ Inicia sesión para ver tus favoritos', false);
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
        favoritesContent.innerHTML = '<p class="message-info">No tienes favoritos aún</p>';
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
