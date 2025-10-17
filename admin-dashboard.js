// Admin Dashboard - Panel de Administración v8.0
// Dashboard completo para gestionar productos, pedidos, usuarios, reviews y estadísticas

class AdminDashboard {
    constructor() {
        this.authSystem = window.authSystem;
        this.checkoutSystem = window.checkoutSystem;
        this.reviewSystem = window.reviewSystem;
        this.isAdmin = false;
        this.stats = {};

        this.init();
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    init() {
        this.checkAdminAccess();
        if (this.isAdmin) {
            this.loadStats();
        }
    }

    checkAdminAccess() {
        const user = this.authSystem?.getCurrentUser();

        // Usuarios admin predefinidos
        const adminUsers = ['admin', 'demo'];

        this.isAdmin = user && adminUsers.includes(user.username);
        return this.isAdmin;
    }

    // ============================================
    // ESTADÍSTICAS GENERALES
    // ============================================

    loadStats() {
        this.stats = {
            users: this.getUserStats(),
            orders: this.getOrderStats(),
            products: this.getProductStats(),
            reviews: this.getReviewStats(),
            revenue: this.getRevenueStats(),
            traffic: this.getTrafficStats()
        };

        return this.stats;
    }

    getUserStats() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const newUsersLast30Days = users.filter(u =>
            new Date(u.createdAt) >= last30Days
        ).length;

        const newUsersLast7Days = users.filter(u =>
            new Date(u.createdAt) >= last7Days
        ).length;

        const activeUsers = users.filter(u =>
            u.lastLogin && new Date(u.lastLogin) >= last7Days
        ).length;

        return {
            total: users.length,
            newLast30Days: newUsersLast30Days,
            newLast7Days: newUsersLast7Days,
            active: activeUsers,
            inactiveRate: ((users.length - activeUsers) / users.length * 100).toFixed(1)
        };
    }

    getOrderStats() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        const statusCount = {
            confirmed: 0,
            preparing: 0,
            shipped: 0,
            in_transit: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            if (statusCount.hasOwnProperty(order.status)) {
                statusCount[order.status]++;
            }
        });

        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const ordersLast30Days = orders.filter(o =>
            new Date(o.createdAt) >= last30Days
        ).length;

        const averageOrderValue = orders.length > 0
            ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length
            : 0;

        return {
            total: orders.length,
            last30Days: ordersLast30Days,
            statusBreakdown: statusCount,
            averageValue: averageOrderValue,
            completionRate: ((statusCount.delivered / orders.length) * 100).toFixed(1)
        };
    }

    getProductStats() {
        const products = this.getAllProducts();

        const categories = {};
        const brands = {};
        let totalStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        products.forEach(product => {
            // Categorías
            if (!categories[product.category]) {
                categories[product.category] = 0;
            }
            categories[product.category]++;

            // Marcas
            if (!brands[product.brand]) {
                brands[product.brand] = 0;
            }
            brands[product.brand]++;

            // Stock
            totalStock += product.stock || 0;
            if (product.stock === 0) {
                outOfStock++;
            } else if (product.stock <= 5) {
                lowStock++;
            }
        });

        return {
            total: products.length,
            categories: Object.keys(categories).length,
            brands: Object.keys(brands).length,
            totalStock,
            lowStock,
            outOfStock,
            categoryBreakdown: categories,
            brandBreakdown: brands
        };
    }

    getReviewStats() {
        if (!this.reviewSystem) {
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                reported: 0,
                averageRating: 0
            };
        }

        let total = 0;
        let totalRating = 0;
        const reviews = this.reviewSystem.reviews;

        for (const productId in reviews) {
            reviews[productId].forEach(review => {
                total++;
                totalRating += review.rating;
            });
        }

        const pending = this.reviewSystem.moderationQueue.filter(r => r.status === 'pending').length;
        const reported = this.reviewSystem.reportedReviews.filter(r => r.status === 'pending').length;

        return {
            total,
            pending,
            approved: total - pending,
            rejected: this.reviewSystem.moderationQueue.filter(r => r.status === 'rejected').length,
            reported,
            averageRating: total > 0 ? (totalRating / total).toFixed(1) : 0
        };
    }

    getRevenueStats() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const revenueThisMonth = orders
            .filter(o => new Date(o.createdAt) >= thisMonth && o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        const revenueLastMonth = orders
            .filter(o => {
                const date = new Date(o.createdAt);
                return date >= lastMonth && date < thisMonth && o.status !== 'cancelled';
            })
            .reduce((sum, o) => sum + o.total, 0);

        const revenueLast30Days = orders
            .filter(o => new Date(o.createdAt) >= last30Days && o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);

        const growth = revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
            : 0;

        return {
            total: totalRevenue,
            thisMonth: revenueThisMonth,
            lastMonth: revenueLastMonth,
            last30Days: revenueLast30Days,
            growth: parseFloat(growth)
        };
    }

    getTrafficStats() {
        const events = JSON.parse(localStorage.getItem('pwa_events') || '[]');

        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const eventsLast30Days = events.filter(e =>
            new Date(e.timestamp) >= last30Days
        );

        const eventTypes = {};
        eventsLast30Days.forEach(e => {
            if (!eventTypes[e.name]) {
                eventTypes[e.name] = 0;
            }
            eventTypes[e.name]++;
        });

        return {
            totalEvents: events.length,
            last30Days: eventsLast30Days.length,
            eventBreakdown: eventTypes,
            averagePerDay: (eventsLast30Days.length / 30).toFixed(1)
        };
    }

    // ============================================
    // GESTIÓN DE PRODUCTOS
    // ============================================

    getAllProducts() {
        // Combinar productos base + personalizados
        const baseProducts = window.products || [];
        const customProducts = JSON.parse(localStorage.getItem('bot_custom_products') || '[]');

        return [...baseProducts, ...customProducts];
    }

    addProduct(productData) {
        const requiredFields = ['name', 'brand', 'category', 'price'];

        for (const field of requiredFields) {
            if (!productData[field]) {
                return { success: false, message: `Campo requerido: ${field}` };
            }
        }

        const newProduct = {
            id: 'prod_' + Date.now(),
            name: productData.name,
            brand: productData.brand,
            category: productData.category,
            model: productData.model || 'Universal',
            price: parseFloat(productData.price),
            discount: parseFloat(productData.discount) || 0,
            rating: parseFloat(productData.rating) || 0,
            stock: parseInt(productData.stock) || 0,
            image: productData.image || '🔧',
            description: productData.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const customProducts = JSON.parse(localStorage.getItem('bot_custom_products') || '[]');
        customProducts.push(newProduct);
        localStorage.setItem('bot_custom_products', JSON.stringify(customProducts));

        return { success: true, message: 'Producto agregado', product: newProduct };
    }

    updateProduct(productId, updates) {
        const customProducts = JSON.parse(localStorage.getItem('bot_custom_products') || '[]');
        const index = customProducts.findIndex(p => p.id === productId);

        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }

        customProducts[index] = {
            ...customProducts[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('bot_custom_products', JSON.stringify(customProducts));

        return { success: true, message: 'Producto actualizado', product: customProducts[index] };
    }

    deleteProduct(productId) {
        const customProducts = JSON.parse(localStorage.getItem('bot_custom_products') || '[]');
        const index = customProducts.findIndex(p => p.id === productId);

        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }

        customProducts.splice(index, 1);
        localStorage.setItem('bot_custom_products', JSON.stringify(customProducts));

        return { success: true, message: 'Producto eliminado' };
    }

    updateStock(productId, newStock) {
        return this.updateProduct(productId, { stock: parseInt(newStock) });
    }

    // ============================================
    // GESTIÓN DE PEDIDOS
    // ============================================

    getAllOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    getOrderById(orderId) {
        const orders = this.getAllOrders();
        return orders.find(o => o.id === orderId);
    }

    updateOrderStatus(orderId, newStatus) {
        const orders = this.getAllOrders();
        const index = orders.findIndex(o => o.id === orderId);

        if (index === -1) {
            return { success: false, message: 'Pedido no encontrado' };
        }

        orders[index].status = newStatus;
        orders[index].statusHistory = orders[index].statusHistory || [];
        orders[index].statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('orders', JSON.stringify(orders));

        return { success: true, message: 'Estado actualizado', order: orders[index] };
    }

    cancelOrder(orderId, reason) {
        const result = this.updateOrderStatus(orderId, 'cancelled');

        if (result.success) {
            const orders = this.getAllOrders();
            const order = orders.find(o => o.id === orderId);
            order.cancellationReason = reason;
            localStorage.setItem('orders', JSON.stringify(orders));
        }

        return result;
    }

    // ============================================
    // GESTIÓN DE USUARIOS
    // ============================================

    getAllUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getUserById(userId) {
        const users = this.getAllUsers();
        return users.find(u => u.id === userId);
    }

    updateUser(userId, updates) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        users[index] = {
            ...users[index],
            ...updates
        };

        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, message: 'Usuario actualizado', user: users[index] };
    }

    suspendUser(userId, reason) {
        return this.updateUser(userId, {
            suspended: true,
            suspensionReason: reason,
            suspendedAt: new Date().toISOString()
        });
    }

    unsuspendUser(userId) {
        return this.updateUser(userId, {
            suspended: false,
            suspensionReason: null,
            suspendedAt: null
        });
    }

    // ============================================
    // REPORTES Y EXPORTACIÓN
    // ============================================

    generateSalesReport(startDate, endDate) {
        const orders = this.getAllOrders();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const filteredOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= start && orderDate <= end && o.status !== 'cancelled';
        });

        const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = filteredOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Productos más vendidos
        const productSales = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.name].quantity += item.quantity;
                productSales[item.name].revenue += item.price * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        return {
            period: { startDate, endDate },
            totalSales,
            totalOrders,
            averageOrderValue,
            topProducts,
            orders: filteredOrders
        };
    }

    exportDataToCSV(dataType) {
        let data, headers, rows;

        switch (dataType) {
            case 'orders':
                data = this.getAllOrders();
                headers = ['ID', 'Usuario', 'Total', 'Estado', 'Método de Pago', 'Fecha'];
                rows = data.map(o => [
                    o.id,
                    o.userId || 'Invitado',
                    o.total,
                    o.status,
                    o.paymentMethod,
                    new Date(o.createdAt).toLocaleString()
                ]);
                break;

            case 'users':
                data = this.getAllUsers();
                headers = ['ID', 'Username', 'Email', 'Nombre', 'Fecha Registro'];
                rows = data.map(u => [
                    u.id,
                    u.username,
                    u.email,
                    u.fullName,
                    new Date(u.createdAt).toLocaleString()
                ]);
                break;

            case 'products':
                data = this.getAllProducts();
                headers = ['ID', 'Nombre', 'Marca', 'Categoría', 'Precio', 'Stock'];
                rows = data.map(p => [
                    p.id,
                    p.name,
                    p.brand,
                    p.category,
                    p.price,
                    p.stock || 0
                ]);
                break;

            default:
                return { success: false, message: 'Tipo de datos no válido' };
        }

        // Generar CSV
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        return {
            success: true,
            csv,
            filename: `${dataType}_${new Date().toISOString().split('T')[0]}.csv`
        };
    }

    // ============================================
    // DASHBOARD UI
    // ============================================

    renderDashboard() {
        if (!this.isAdmin) {
            return '<div class="error">Acceso denegado. Solo administradores.</div>';
        }

        const stats = this.loadStats();

        return `
            <div class="admin-dashboard">
                <h1>📊 Panel de Administración</h1>

                <!-- Resumen General -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-value">${stats.users.total}</div>
                        <div class="stat-label">Usuarios Totales</div>
                        <div class="stat-detail">+${stats.users.newLast30Days} últimos 30 días</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-value">${stats.orders.total}</div>
                        <div class="stat-label">Pedidos Totales</div>
                        <div class="stat-detail">${stats.orders.last30Days} últimos 30 días</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value">$${stats.revenue.total.toLocaleString()}</div>
                        <div class="stat-label">Ingresos Totales</div>
                        <div class="stat-detail">${stats.revenue.growth > 0 ? '+' : ''}${stats.revenue.growth}% vs mes anterior</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-value">${stats.reviews.total}</div>
                        <div class="stat-label">Reseñas</div>
                        <div class="stat-detail">${stats.reviews.pending} pendientes</div>
                    </div>
                </div>

                <!-- Acciones Rápidas -->
                <div class="quick-actions">
                    <h2>⚡ Acciones Rápidas</h2>
                    <div class="action-buttons">
                        <button onclick="adminDashboard.showSection('orders')">Ver Pedidos</button>
                        <button onclick="adminDashboard.showSection('products')">Gestionar Productos</button>
                        <button onclick="adminDashboard.showSection('users')">Gestionar Usuarios</button>
                        <button onclick="adminDashboard.showSection('reviews')">Moderar Reseñas</button>
                        <button onclick="adminDashboard.showSection('reports')">Generar Reportes</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AdminDashboard = AdminDashboard;
}
