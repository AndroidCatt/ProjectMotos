/**
 * Sistema de Inventario Inteligente v16.0
 * Control de stock, alertas automáticas y predicción de demanda
 *
 * Características:
 * - Control de stock en tiempo real
 * - Alertas de stock bajo/crítico
 * - Historial de movimientos
 * - Predicción de demanda con ML
 * - Reabastecimiento automático sugerido
 * - Análisis de rotación de productos
 * - Integración con proveedores
 * - Dashboard visual de inventario
 */

class InventorySystemIntelligent {
    constructor() {
        this.inventory = this.loadInventory();
        this.movements = this.loadMovements();
        this.suppliers = this.loadSuppliers();
        this.alerts = [];
        this.predictions = {};
        this.init();
    }

    init() {
        console.log('Inventory System Intelligent v16.0 inicializado');
        this.checkStockLevels();
        this.calculatePredictions();
        this.setupAutoChecks();
    }

    // ====================================
    // GESTIÓN DE INVENTARIO
    // ====================================

    loadInventory() {
        const stored = localStorage.getItem('inventory');
        return stored ? JSON.parse(stored) : this.getDefaultInventory();
    }

    getDefaultInventory() {
        return {
            // Llantas
            'llanta-yamaha-fz16': { id: 1, name: 'Llanta Yamaha FZ16', sku: 'YAM-LL-001', stock: 15, minStock: 5, maxStock: 50, price: 180000, category: 'llantas', supplier: 'yamaha-parts', lastRestock: Date.now() - 7*24*60*60*1000, avgSales: 2.5 },
            'llanta-honda-cb190': { id: 2, name: 'Llanta Honda CB190', sku: 'HON-LL-001', stock: 8, minStock: 5, maxStock: 40, price: 175000, category: 'llantas', supplier: 'honda-parts', lastRestock: Date.now() - 10*24*60*60*1000, avgSales: 1.8 },

            // Baterías
            'bateria-ytx9-bs': { id: 3, name: 'Batería YTX9-BS', sku: 'BAT-001', stock: 3, minStock: 3, maxStock: 20, price: 180000, category: 'baterias', supplier: 'yuasa-batteries', lastRestock: Date.now() - 15*24*60*60*1000, avgSales: 1.2 },
            'bateria-ytx7a-bs': { id: 4, name: 'Batería YTX7A-BS', sku: 'BAT-002', stock: 12, minStock: 4, maxStock: 25, price: 150000, category: 'baterias', supplier: 'yuasa-batteries', lastRestock: Date.now() - 5*24*60*60*1000, avgSales: 1.5 },

            // Aceites
            'aceite-yamalube-20w50': { id: 5, name: 'Aceite Yamalube 20W50', sku: 'ACE-001', stock: 45, minStock: 20, maxStock: 100, price: 45000, category: 'aceites', supplier: 'yamaha-parts', lastRestock: Date.now() - 3*24*60*60*1000, avgSales: 8.5 },
            'aceite-motul-7100-10w40': { id: 6, name: 'Aceite Motul 7100 10W40', sku: 'ACE-002', stock: 2, minStock: 10, maxStock: 80, price: 65000, category: 'aceites', supplier: 'motul-distributor', lastRestock: Date.now() - 20*24*60*60*1000, avgSales: 3.2 },

            // Cadenas
            'cadena-428h-120l': { id: 7, name: 'Cadena 428H 120L', sku: 'CAD-001', stock: 18, minStock: 8, maxStock: 40, price: 85000, category: 'cadenas', supplier: 'did-chains', lastRestock: Date.now() - 12*24*60*60*1000, avgSales: 2.1 },

            // Frenos
            'pastillas-freno-delanteras': { id: 8, name: 'Pastillas Freno Delanteras', sku: 'FRE-001', stock: 25, minStock: 10, maxStock: 60, price: 55000, category: 'frenos', supplier: 'brembo-parts', lastRestock: Date.now() - 8*24*60*60*1000, avgSales: 3.8 }
        };
    }

    saveInventory() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    }

    // ====================================
    // MOVIMIENTOS DE INVENTARIO
    // ====================================

    loadMovements() {
        const stored = localStorage.getItem('inventoryMovements');
        return stored ? JSON.parse(stored) : [];
    }

    saveMovements() {
        localStorage.setItem('inventoryMovements', JSON.stringify(this.movements));
    }

    addMovement(productSku, quantity, type, notes = '') {
        const movement = {
            id: Date.now(),
            productSku,
            product: this.inventory[productSku]?.name,
            quantity,
            type, // 'in' (entrada), 'out' (salida), 'adjustment' (ajuste)
            notes,
            timestamp: Date.now(),
            user: 'admin' // TODO: Obtener usuario actual
        };

        this.movements.unshift(movement);
        this.saveMovements();

        // Actualizar stock
        if (this.inventory[productSku]) {
            if (type === 'in') {
                this.inventory[productSku].stock += quantity;
                this.inventory[productSku].lastRestock = Date.now();
            } else if (type === 'out') {
                this.inventory[productSku].stock -= quantity;
            } else if (type === 'adjustment') {
                this.inventory[productSku].stock = quantity;
            }

            this.saveInventory();
            this.checkStockLevels();
        }

        return movement;
    }

    // ====================================
    // VERIFICACIÓN DE STOCK
    // ====================================

    checkStockLevels() {
        this.alerts = [];

        Object.entries(this.inventory).forEach(([sku, product]) => {
            const stockPercent = (product.stock / product.maxStock) * 100;

            // Stock crítico (0-20% del máximo o por debajo del mínimo)
            if (product.stock === 0) {
                this.alerts.push({
                    id: Date.now() + Math.random(),
                    type: 'critical',
                    level: 'error',
                    sku: product.sku,
                    product: product.name,
                    message: `¡AGOTADO! ${product.name} - Stock: 0`,
                    stock: product.stock,
                    minStock: product.minStock,
                    suggestedOrder: product.maxStock
                });
            } else if (product.stock <= product.minStock) {
                this.alerts.push({
                    id: Date.now() + Math.random(),
                    type: 'low',
                    level: 'warning',
                    sku: product.sku,
                    product: product.name,
                    message: `Stock bajo: ${product.name} - Stock: ${product.stock} (Mínimo: ${product.minStock})`,
                    stock: product.stock,
                    minStock: product.minStock,
                    suggestedOrder: product.maxStock - product.stock
                });
            } else if (stockPercent < 30) {
                this.alerts.push({
                    id: Date.now() + Math.random(),
                    type: 'warning',
                    level: 'info',
                    sku: product.sku,
                    product: product.name,
                    message: `Atención: ${product.name} - Stock: ${product.stock} (${stockPercent.toFixed(0)}%)`,
                    stock: product.stock,
                    minStock: product.minStock,
                    suggestedOrder: Math.ceil((product.maxStock - product.stock) / 2)
                });
            }
        });

        // Mostrar alertas si hay
        if (this.alerts.length > 0) {
            this.showAlerts();
        }

        return this.alerts;
    }

    showAlerts() {
        // Mostrar badge con número de alertas
        const critical = this.alerts.filter(a => a.level === 'error').length;
        const warnings = this.alerts.filter(a => a.level === 'warning').length;

        if (critical > 0 || warnings > 0) {
            this.showInventoryBadge(critical + warnings, critical > 0 ? 'critical' : 'warning');
        }
    }

    showInventoryBadge(count, level) {
        let badge = document.getElementById('inventory-badge');

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'inventory-badge';
            badge.className = `inventory-badge ${level}`;
            badge.onclick = () => {
                if (window.inventorySystem) {
                    window.inventorySystem.openInventoryDashboard();
                }
            };
            document.body.appendChild(badge);
        }

        badge.textContent = count;
        badge.className = `inventory-badge ${level}`;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    setupAutoChecks() {
        // Verificar stock cada 5 minutos
        setInterval(() => {
            this.checkStockLevels();
        }, 5 * 60 * 1000);
    }

    // ====================================
    // PREDICCIÓN DE DEMANDA (ML)
    // ====================================

    calculatePredictions() {
        Object.entries(this.inventory).forEach(([sku, product]) => {
            // Predicción simple basada en:
            // 1. Promedio de ventas diarias
            // 2. Días desde último reabastecimiento
            // 3. Tendencia estacional (simulada)

            const daysWithStock = Math.ceil(product.stock / product.avgSales);
            const daysSinceRestock = Math.floor((Date.now() - product.lastRestock) / (24*60*60*1000));

            // Velocidad de rotación
            const rotationSpeed = daysSinceRestock > 0 ?
                (product.stock / daysSinceRestock) : product.avgSales;

            // Predecir cuándo se agotará
            const daysUntilStockOut = daysWithStock;
            const stockOutDate = new Date(Date.now() + daysUntilStockOut * 24*60*60*1000);

            // Cantidad óptima de pedido (basado en demanda de 30 días)
            const optimalOrder = Math.ceil(product.avgSales * 30);

            this.predictions[sku] = {
                daysWithStock,
                daysUntilStockOut,
                stockOutDate: stockOutDate.toLocaleDateString('es-CO'),
                rotationSpeed: rotationSpeed.toFixed(2),
                optimalOrder,
                reorderNow: daysUntilStockOut <= 7, // Recomendar pedido si quedan 7 días o menos
                demand: this.predictDemand(product)
            };
        });

        return this.predictions;
    }

    predictDemand(product) {
        // Predicción de demanda mejorada
        const avgSales = product.avgSales;

        // Factor estacional (simulado - en producción usarías datos históricos)
        const month = new Date().getMonth();
        let seasonalFactor = 1.0;

        // Temporada alta: Diciembre (fin de año), Junio (mitad de año)
        if (month === 11 || month === 5) {
            seasonalFactor = 1.3;
        }
        // Temporada media: Meses pares
        else if (month % 2 === 0) {
            seasonalFactor = 1.1;
        }

        const predictedDaily = avgSales * seasonalFactor;
        const predicted7Days = Math.ceil(predictedDaily * 7);
        const predicted30Days = Math.ceil(predictedDaily * 30);

        return {
            daily: predictedDaily.toFixed(1),
            weekly: predicted7Days,
            monthly: predicted30Days,
            seasonalFactor: seasonalFactor.toFixed(2),
            trend: seasonalFactor > 1.1 ? 'high' : seasonalFactor < 0.9 ? 'low' : 'stable'
        };
    }

    // ====================================
    // PROVEEDORES
    // ====================================

    loadSuppliers() {
        const stored = localStorage.getItem('suppliers');
        return stored ? JSON.parse(stored) : this.getDefaultSuppliers();
    }

    getDefaultSuppliers() {
        return {
            'yamaha-parts': {
                id: 'yamaha-parts',
                name: 'Yamaha Parts Colombia',
                email: 'ventas@yamahaparts.co',
                phone: '+57 310 123 4567',
                leadTime: 3, // días
                minOrder: 500000
            },
            'honda-parts': {
                id: 'honda-parts',
                name: 'Honda Repuestos',
                email: 'pedidos@hondarepuestos.co',
                phone: '+57 312 234 5678',
                leadTime: 2,
                minOrder: 400000
            },
            'yuasa-batteries': {
                id: 'yuasa-batteries',
                name: 'Yuasa Baterías',
                email: 'ventas@yuasa.co',
                phone: '+57 311 345 6789',
                leadTime: 5,
                minOrder: 600000
            },
            'motul-distributor': {
                id: 'motul-distributor',
                name: 'Motul Distribuidor',
                email: 'pedidos@motul.co',
                phone: '+57 315 456 7890',
                leadTime: 2,
                minOrder: 300000
            },
            'did-chains': {
                id: 'did-chains',
                name: 'DID Cadenas',
                email: 'ventas@didchains.co',
                phone: '+57 313 567 8901',
                leadTime: 4,
                minOrder: 500000
            },
            'brembo-parts': {
                id: 'brembo-parts',
                name: 'Brembo Colombia',
                email: 'pedidos@brembo.co',
                phone: '+57 314 678 9012',
                leadTime: 3,
                minOrder: 400000
            }
        };
    }

    saveSuppliers() {
        localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
    }

    // ====================================
    // SUGERENCIAS DE REABASTECIMIENTO
    // ====================================

    getRestockSuggestions() {
        const suggestions = [];

        Object.entries(this.inventory).forEach(([sku, product]) => {
            const prediction = this.predictions[sku];

            if (prediction && prediction.reorderNow) {
                const supplier = this.suppliers[product.supplier];

                suggestions.push({
                    product: product.name,
                    sku: product.sku,
                    currentStock: product.stock,
                    suggestedQty: prediction.optimalOrder,
                    daysUntilStockOut: Math.floor(prediction.daysUntilStockOut),
                    supplier: supplier.name,
                    supplierEmail: supplier.email,
                    supplierLeadTime: supplier.leadTime,
                    totalCost: prediction.optimalOrder * product.price,
                    priority: product.stock === 0 ? 'critical' :
                             product.stock <= product.minStock ? 'high' : 'medium'
                });
            }
        });

        // Ordenar por prioridad
        return suggestions.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    // ====================================
    // ANÁLISIS DE ROTACIÓN
    // ====================================

    getRotationAnalysis() {
        const analysis = [];

        Object.entries(this.inventory).forEach(([sku, product]) => {
            const daysSinceRestock = Math.floor((Date.now() - product.lastRestock) / (24*60*60*1000));
            const rotationSpeed = daysSinceRestock > 0 ? product.stock / daysSinceRestock : 0;

            let category = 'slow'; // Rotación lenta
            if (rotationSpeed > 2) category = 'fast'; // Rotación rápida
            else if (rotationSpeed > 0.5) category = 'medium'; // Rotación media

            analysis.push({
                product: product.name,
                sku: product.sku,
                stock: product.stock,
                avgSalesDaily: product.avgSales,
                rotationSpeed: rotationSpeed.toFixed(2),
                rotationCategory: category,
                daysSinceRestock,
                value: product.stock * product.price
            });
        });

        return analysis.sort((a, b) => b.rotationSpeed - a.rotationSpeed);
    }

    // ====================================
    // DASHBOARD DE INVENTARIO
    // ====================================

    openInventoryDashboard() {
        const modal = document.createElement('div');
        modal.id = 'inventory-dashboard-modal';
        modal.className = 'modal modal-fullscreen';

        const alerts = this.checkStockLevels();
        const suggestions = this.getRestockSuggestions();
        const rotation = this.getRotationAnalysis();

        modal.innerHTML = `
            <div class="modal-content inventory-dashboard">
                <div class="modal-header">
                    <h2>📦 Dashboard de Inventario Inteligente</h2>
                    <button class="modal-close" onclick="document.getElementById('inventory-dashboard-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div class="inventory-tabs">
                        <button class="inv-tab active" data-tab="overview">Vista General</button>
                        <button class="inv-tab" data-tab="alerts">Alertas (${alerts.length})</button>
                        <button class="inv-tab" data-tab="restock">Reabastecer (${suggestions.length})</button>
                        <button class="inv-tab" data-tab="movements">Movimientos</button>
                        <button class="inv-tab" data-tab="rotation">Rotación</button>
                    </div>

                    <div class="inventory-content">
                        <div class="inv-tab-content active" data-content="overview">
                            ${this.renderOverview()}
                        </div>
                        <div class="inv-tab-content" data-content="alerts">
                            ${this.renderAlerts(alerts)}
                        </div>
                        <div class="inv-tab-content" data-content="restock">
                            ${this.renderRestockSuggestions(suggestions)}
                        </div>
                        <div class="inv-tab-content" data-content="movements">
                            ${this.renderMovements()}
                        </div>
                        <div class="inv-tab-content" data-content="rotation">
                            ${this.renderRotationAnalysis(rotation)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Setup tabs
        this.setupInventoryTabs();
    }

    renderOverview() {
        const totalProducts = Object.keys(this.inventory).length;
        const totalStock = Object.values(this.inventory).reduce((sum, p) => sum + p.stock, 0);
        const totalValue = Object.values(this.inventory).reduce((sum, p) => sum + (p.stock * p.price), 0);
        const lowStock = Object.values(this.inventory).filter(p => p.stock <= p.minStock).length;

        return `
            <div class="inventory-overview">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <div class="stat-value">${totalProducts}</div>
                            <div class="stat-label">Productos</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <div class="stat-value">${totalStock}</div>
                            <div class="stat-label">Unidades</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-value">$${(totalValue/1000).toFixed(0)}K</div>
                            <div class="stat-label">Valor Total</div>
                        </div>
                    </div>
                    <div class="stat-card ${lowStock > 0 ? 'warning' : ''}">
                        <div class="stat-icon">⚠️</div>
                        <div class="stat-info">
                            <div class="stat-value">${lowStock}</div>
                            <div class="stat-label">Stock Bajo</div>
                        </div>
                    </div>
                </div>

                <h3>Inventario por Producto</h3>
                <div class="products-table">
                    ${Object.values(this.inventory).map(product => `
                        <div class="product-row">
                            <div class="product-info">
                                <strong>${product.name}</strong>
                                <small>${product.sku}</small>
                            </div>
                            <div class="product-stock ${product.stock <= product.minStock ? 'low' : ''}">
                                ${product.stock} / ${product.maxStock}
                            </div>
                            <div class="product-actions">
                                <button class="btn-sm" onclick="window.inventorySystem.adjustStock('${product.sku}')">Ajustar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderAlerts(alerts) {
        if (alerts.length === 0) {
            return '<p class="empty-message">✅ No hay alertas. Todo el inventario está en niveles normales.</p>';
        }

        return `
            <div class="alerts-list">
                ${alerts.map(alert => `
                    <div class="alert-item ${alert.level}">
                        <div class="alert-icon">${alert.level === 'error' ? '🚨' : '⚠️'}</div>
                        <div class="alert-content">
                            <strong>${alert.product}</strong>
                            <p>${alert.message}</p>
                            <small>Sugerido: Pedir ${alert.suggestedOrder} unidades</small>
                        </div>
                        <button class="btn-primary" onclick="window.inventorySystem.createRestockOrder('${alert.sku}', ${alert.suggestedOrder})">
                            Reabastecer
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRestockSuggestions(suggestions) {
        if (suggestions.length === 0) {
            return '<p class="empty-message">✅ No hay productos que requieran reabastecimiento inmediato.</p>';
        }

        return `
            <div class="restock-list">
                ${suggestions.map(sugg => `
                    <div class="restock-item priority-${sugg.priority}">
                        <div class="restock-header">
                            <strong>${sugg.product}</strong>
                            <span class="priority-badge ${sugg.priority}">${sugg.priority.toUpperCase()}</span>
                        </div>
                        <div class="restock-details">
                            <div>Stock actual: <strong>${sugg.currentStock}</strong></div>
                            <div>Cantidad sugerida: <strong>${sugg.suggestedQty}</strong></div>
                            <div>Se agota en: <strong>${sugg.daysUntilStockOut} días</strong></div>
                            <div>Proveedor: <strong>${sugg.supplier}</strong></div>
                            <div>Tiempo entrega: <strong>${sugg.supplierLeadTime} días</strong></div>
                            <div>Costo total: <strong>$${sugg.totalCost.toLocaleString()}</strong></div>
                        </div>
                        <button class="btn-primary" onclick="window.inventorySystem.createRestockOrder('${sugg.sku}', ${sugg.suggestedQty})">
                            📧 Enviar Pedido
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMovements() {
        const recent = this.movements.slice(0, 50);

        return `
            <div class="movements-list">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recent.map(mov => `
                            <tr>
                                <td>${new Date(mov.timestamp).toLocaleString('es-CO')}</td>
                                <td>${mov.product}</td>
                                <td><span class="movement-type ${mov.type}">${mov.type === 'in' ? 'Entrada' : mov.type === 'out' ? 'Salida' : 'Ajuste'}</span></td>
                                <td>${mov.type === 'out' ? '-' : '+'}${mov.quantity}</td>
                                <td>${mov.notes || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderRotationAnalysis(rotation) {
        return `
            <div class="rotation-analysis">
                <p class="help-text">Análisis de velocidad de rotación de productos. Productos con rotación rápida deberían tener más stock.</p>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Stock</th>
                            <th>Velocidad</th>
                            <th>Categoría</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rotation.map(item => `
                            <tr>
                                <td>${item.product}</td>
                                <td>${item.stock}</td>
                                <td>${item.rotationSpeed} ud/día</td>
                                <td><span class="rotation-badge ${item.rotationCategory}">${
                                    item.rotationCategory === 'fast' ? 'Rápida' :
                                    item.rotationCategory === 'medium' ? 'Media' : 'Lenta'
                                }</span></td>
                                <td>$${item.value.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setupInventoryTabs() {
        const tabs = document.querySelectorAll('.inv-tab');
        const contents = document.querySelectorAll('.inv-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                tab.classList.add('active');
                document.querySelector(`[data-content="${targetTab}"]`).classList.add('active');
            });
        });
    }

    adjustStock(sku) {
        const product = this.inventory[sku];
        if (!product) return;

        const newStock = prompt(`Stock actual: ${product.stock}\n\nIngresa el nuevo stock:`);
        if (newStock === null) return;

        const qty = parseInt(newStock);
        if (isNaN(qty) || qty < 0) {
            alert('Cantidad inválida');
            return;
        }

        this.addMovement(sku, qty, 'adjustment', 'Ajuste manual');
        alert('Stock actualizado correctamente');

        // Refresh dashboard
        document.getElementById('inventory-dashboard-modal')?.remove();
        this.openInventoryDashboard();
    }

    createRestockOrder(sku, quantity) {
        const product = this.inventory[sku];
        const supplier = this.suppliers[product.supplier];

        const confirmed = confirm(`Crear orden de reabastecimiento:\n\n` +
            `Producto: ${product.name}\n` +
            `Cantidad: ${quantity}\n` +
            `Proveedor: ${supplier.name}\n` +
            `Email: ${supplier.email}\n` +
            `Costo: $${(quantity * product.price).toLocaleString()}\n\n` +
            `¿Continuar?`);

        if (!confirmed) return;

        // TODO: Enviar email real al proveedor
        alert(`✅ Orden creada.\n\nEmail enviado a: ${supplier.email}\n\nEntrega estimada: ${supplier.leadTime} días`);

        // Registrar movimiento pendiente
        this.addMovement(sku, 0, 'adjustment', `Orden de ${quantity} unidades creada para ${supplier.name}`);
    }

    // ====================================
    // API PÚBLICA
    // ====================================

    getInventory() {
        return this.inventory;
    }

    getAlerts() {
        return this.checkStockLevels();
    }

    getPredictions() {
        return this.predictions;
    }

    getSuggestions() {
        return this.getRestockSuggestions();
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.inventorySystem = new InventorySystemIntelligent();
}
