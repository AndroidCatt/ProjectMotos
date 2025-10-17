// Checkout System - Sistema de Pago y Procesamiento de Pedidos v7.0
// Sistema completo de checkout, pagos y gestión de pedidos

class CheckoutSystem {
    constructor(authSystem) {
        this.authSystem = authSystem;
        this.currentOrder = null;
        this.shippingMethods = this.initShippingMethods();
        this.paymentMethods = this.initPaymentMethods();
    }

    // ============================================
    // MÉTODOS DE ENVÍO
    // ============================================

    initShippingMethods() {
        return [
            {
                id: 'standard',
                name: 'Envío Estándar',
                description: 'Entrega en 5-7 días hábiles',
                price: 15000,
                icon: '📦',
                estimatedDays: '5-7'
            },
            {
                id: 'express',
                name: 'Envío Express',
                description: 'Entrega en 2-3 días hábiles',
                price: 25000,
                icon: '⚡',
                estimatedDays: '2-3'
            },
            {
                id: 'same-day',
                name: 'Envío Mismo Día',
                description: 'Solo Bogotá, Medellín, Cali (pedidos antes de 12pm)',
                price: 35000,
                icon: '🚀',
                estimatedDays: 'Hoy'
            },
            {
                id: 'pickup',
                name: 'Recoger en Tienda',
                description: 'Retira en nuestras oficinas sin costo',
                price: 0,
                icon: '🏪',
                estimatedDays: '1-2'
            }
        ];
    }

    getShippingMethods() {
        return this.shippingMethods;
    }

    getShippingMethod(id) {
        return this.shippingMethods.find(m => m.id === id);
    }

    // ============================================
    // MÉTODOS DE PAGO
    // ============================================

    initPaymentMethods() {
        return [
            {
                id: 'credit-card',
                name: 'Tarjeta de Crédito',
                description: 'Visa, Mastercard, American Express',
                icon: '💳',
                enabled: true,
                fees: 0
            },
            {
                id: 'debit-card',
                name: 'Tarjeta Débito',
                description: 'PSE - Débito a cuentas de ahorro o corriente',
                icon: '💳',
                enabled: true,
                fees: 0
            },
            {
                id: 'pse',
                name: 'PSE',
                description: 'Pago Seguro en Línea',
                icon: '🏦',
                enabled: true,
                fees: 0
            },
            {
                id: 'nequi',
                name: 'Nequi',
                description: 'Pago con tu cuenta Nequi',
                icon: '📱',
                enabled: true,
                fees: 0
            },
            {
                id: 'daviplata',
                name: 'Daviplata',
                description: 'Pago con tu cuenta Daviplata',
                icon: '📱',
                enabled: true,
                fees: 0
            },
            {
                id: 'cash',
                name: 'Efectivo',
                description: 'Paga en efectivo contra entrega',
                icon: '💵',
                enabled: true,
                fees: 5000 // Cargo por manejo de efectivo
            },
            {
                id: 'bank-transfer',
                name: 'Transferencia Bancaria',
                description: 'Transferencia a cuenta bancaria',
                icon: '🏦',
                enabled: true,
                fees: 0
            }
        ];
    }

    getPaymentMethods() {
        return this.paymentMethods.filter(m => m.enabled);
    }

    getPaymentMethod(id) {
        return this.paymentMethods.find(m => m.id === id);
    }

    // ============================================
    // VALIDACIONES
    // ============================================

    validateCart(cart) {
        if (!cart || cart.length === 0) {
            return { valid: false, message: 'El carrito está vacío' };
        }

        // Verificar stock de cada producto
        for (const item of cart) {
            if (item.stock < item.quantity) {
                return {
                    valid: false,
                    message: `Stock insuficiente para ${item.name}. Disponible: ${item.stock}`
                };
            }
        }

        return { valid: true };
    }

    validateShippingInfo(shippingInfo) {
        const required = ['fullName', 'phone', 'address', 'city', 'department'];
        const errors = [];

        for (const field of required) {
            if (!shippingInfo[field] || shippingInfo[field].trim() === '') {
                errors.push(`El campo ${this.getFieldLabel(field)} es requerido`);
            }
        }

        // Validar teléfono
        if (shippingInfo.phone && !/^[\d\s\+\-\(\)]+$/.test(shippingInfo.phone)) {
            errors.push('Número de teléfono inválido');
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors[0] : ''
        };
    }

    validatePaymentInfo(paymentMethod, paymentData) {
        const errors = [];

        if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
            // Validar número de tarjeta
            if (!paymentData.cardNumber || !/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
                errors.push('Número de tarjeta inválido');
            }

            // Validar fecha de expiración
            if (!paymentData.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
                errors.push('Fecha de expiración inválida (MM/YY)');
            }

            // Validar CVV
            if (!paymentData.cvv || !/^\d{3,4}$/.test(paymentData.cvv)) {
                errors.push('CVV inválido');
            }

            // Validar nombre en tarjeta
            if (!paymentData.cardholderName || paymentData.cardholderName.trim().length < 3) {
                errors.push('Nombre del titular es requerido');
            }
        }

        if (paymentMethod === 'pse') {
            if (!paymentData.bank || !paymentData.accountType || !paymentData.documentType || !paymentData.documentNumber) {
                errors.push('Completa todos los campos para PSE');
            }
        }

        if (paymentMethod === 'nequi' || paymentMethod === 'daviplata') {
            if (!paymentData.phoneNumber || !/^\d{10}$/.test(paymentData.phoneNumber)) {
                errors.push('Número de celular inválido');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors,
            message: errors.length > 0 ? errors[0] : ''
        };
    }

    getFieldLabel(field) {
        const labels = {
            fullName: 'Nombre completo',
            phone: 'Teléfono',
            address: 'Dirección',
            city: 'Ciudad',
            department: 'Departamento',
            zipCode: 'Código postal'
        };
        return labels[field] || field;
    }

    // ============================================
    // CÁLCULOS
    // ============================================

    calculateOrderTotals(cart, shippingMethodId, couponCode = null) {
        let subtotal = 0;
        let totalDiscount = 0;

        // Calcular subtotal y descuentos de productos
        cart.forEach(item => {
            const itemPrice = item.price * item.quantity;
            const itemDiscount = (itemPrice * item.discount) / 100;
            subtotal += itemPrice;
            totalDiscount += itemDiscount;
        });

        const subtotalAfterDiscount = subtotal - totalDiscount;

        // Agregar costo de envío
        const shippingMethod = this.getShippingMethod(shippingMethodId);
        const shippingCost = shippingMethod ? shippingMethod.price : 0;

        // Aplicar cupón si existe
        let couponDiscount = 0;
        if (couponCode && window.promotionSystem) {
            const couponResult = window.promotionSystem.applyCoupon(couponCode, subtotalAfterDiscount);
            if (couponResult.success) {
                couponDiscount = couponResult.discountAmount;
            }
        }

        // Calcular total final
        const total = subtotalAfterDiscount + shippingCost - couponDiscount;

        return {
            subtotal: subtotal,
            discount: totalDiscount,
            subtotalAfterDiscount: subtotalAfterDiscount,
            shippingCost: shippingCost,
            couponDiscount: couponDiscount,
            total: Math.max(total, 0),
            savings: totalDiscount + couponDiscount
        };
    }

    // ============================================
    // PROCESO DE CHECKOUT
    // ============================================

    initiateCheckout(cart) {
        // Validar carrito
        const cartValidation = this.validateCart(cart);
        if (!cartValidation.valid) {
            return {
                success: false,
                message: cartValidation.message
            };
        }

        // Verificar que el usuario esté logueado
        if (!this.authSystem.isLoggedIn()) {
            return {
                success: false,
                message: 'Debes iniciar sesión para continuar',
                requireLogin: true
            };
        }

        // Crear orden preliminar
        this.currentOrder = {
            id: null, // Se asignará al confirmar
            cart: JSON.parse(JSON.stringify(cart)), // Copia profunda
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        return {
            success: true,
            message: 'Checkout iniciado',
            user: this.authSystem.getCurrentUser()
        };
    }

    async processPayment(orderData) {
        const { cart, shippingInfo, shippingMethod, paymentMethod, paymentData, couponCode } = orderData;

        // Validaciones
        const cartValidation = this.validateCart(cart);
        if (!cartValidation.valid) {
            return { success: false, message: cartValidation.message };
        }

        const shippingValidation = this.validateShippingInfo(shippingInfo);
        if (!shippingValidation.valid) {
            return { success: false, message: shippingValidation.message };
        }

        const paymentValidation = this.validatePaymentInfo(paymentMethod, paymentData);
        if (!paymentValidation.valid) {
            return { success: false, message: paymentValidation.message };
        }

        // Calcular totales
        const totals = this.calculateOrderTotals(cart, shippingMethod, couponCode);

        // Simular procesamiento de pago (en producción conectar con pasarela)
        const paymentResult = await this.simulatePaymentProcessing(paymentMethod, totals.total);

        if (!paymentResult.success) {
            return {
                success: false,
                message: paymentResult.message
            };
        }

        // Crear orden confirmada
        const order = this.createOrder({
            cart,
            shippingInfo,
            shippingMethod,
            paymentMethod,
            totals,
            paymentResult,
            couponCode
        });

        // Guardar en el historial del usuario
        const user = this.authSystem.getCurrentUser();
        if (user) {
            this.authSystem.addOrder(user.id, order);
        }

        // Limpiar orden actual
        this.currentOrder = null;

        return {
            success: true,
            message: '¡Pago procesado exitosamente!',
            order: order
        };
    }

    async simulatePaymentProcessing(paymentMethod, amount) {
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simular éxito del 95%
        const success = Math.random() > 0.05;

        if (!success) {
            const errors = [
                'Fondos insuficientes',
                'Tarjeta rechazada',
                'Error de conexión con el banco',
                'Transacción cancelada'
            ];
            return {
                success: false,
                message: errors[Math.floor(Math.random() * errors.length)]
            };
        }

        return {
            success: true,
            transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            authorizationCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
            processedAt: new Date().toISOString()
        };
    }

    createOrder(orderData) {
        const { cart, shippingInfo, shippingMethod, paymentMethod, totals, paymentResult, couponCode } = orderData;

        const orderId = this.generateOrderId();
        const shippingMethodInfo = this.getShippingMethod(shippingMethod);
        const paymentMethodInfo = this.getPaymentMethod(paymentMethod);

        const order = {
            id: orderId,
            status: 'confirmed',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                brand: item.brand,
                model: item.model,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
                finalPrice: item.price * (1 - item.discount / 100),
                image: item.image
            })),
            customer: {
                userId: this.authSystem.currentUser?.id,
                ...shippingInfo
            },
            shipping: {
                method: shippingMethodInfo,
                estimatedDelivery: this.calculateEstimatedDelivery(shippingMethodInfo.estimatedDays),
                trackingNumber: this.generateTrackingNumber()
            },
            payment: {
                method: paymentMethodInfo.name,
                methodId: paymentMethod,
                transactionId: paymentResult.transactionId,
                authorizationCode: paymentResult.authorizationCode,
                processedAt: paymentResult.processedAt
            },
            pricing: {
                subtotal: totals.subtotal,
                discount: totals.discount,
                shippingCost: totals.shippingCost,
                couponDiscount: totals.couponDiscount,
                couponCode: couponCode,
                total: totals.total
            },
            timeline: [
                {
                    status: 'confirmed',
                    timestamp: new Date().toISOString(),
                    message: 'Pedido confirmado y pago procesado'
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Guardar en localStorage
        this.saveOrder(order);

        return order;
    }

    // ============================================
    // GESTIÓN DE PEDIDOS
    // ============================================

    saveOrder(order) {
        const orders = this.loadAllOrders();
        orders.push(order);
        localStorage.setItem('chatbot_orders', JSON.stringify(orders));
    }

    loadAllOrders() {
        const ordersStr = localStorage.getItem('chatbot_orders');
        return ordersStr ? JSON.parse(ordersStr) : [];
    }

    getOrder(orderId) {
        const orders = this.loadAllOrders();
        return orders.find(o => o.id === orderId);
    }

    getUserOrders(userId) {
        const orders = this.loadAllOrders();
        return orders.filter(o => o.customer.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    updateOrderStatus(orderId, newStatus, message = '') {
        const orders = this.loadAllOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return { success: false, message: 'Pedido no encontrado' };
        }

        const order = orders[orderIndex];
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();

        // Agregar a la línea de tiempo
        order.timeline.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            message: message || this.getStatusMessage(newStatus)
        });

        // Actualizar fecha de entrega si es entregado
        if (newStatus === 'delivered') {
            order.deliveredAt = new Date().toISOString();
        }

        localStorage.setItem('chatbot_orders', JSON.stringify(orders));

        return {
            success: true,
            message: 'Estado actualizado',
            order: order
        };
    }

    getStatusMessage(status) {
        const messages = {
            'confirmed': 'Pedido confirmado',
            'processing': 'Preparando tu pedido',
            'shipped': 'Pedido enviado',
            'in-transit': 'En camino',
            'out-for-delivery': 'Salió para entrega',
            'delivered': 'Pedido entregado',
            'cancelled': 'Pedido cancelado'
        };
        return messages[status] || 'Actualización de estado';
    }

    cancelOrder(orderId, reason = '') {
        const order = this.getOrder(orderId);

        if (!order) {
            return { success: false, message: 'Pedido no encontrado' };
        }

        if (['delivered', 'cancelled'].includes(order.status)) {
            return { success: false, message: 'Este pedido no puede ser cancelado' };
        }

        return this.updateOrderStatus(orderId, 'cancelled', reason || 'Pedido cancelado por el cliente');
    }

    // ============================================
    // UTILIDADES
    // ============================================

    generateOrderId() {
        return 'ORD-' + Date.now().toString().slice(-8) + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    }

    generateTrackingNumber() {
        return 'TRK' + Date.now().toString().slice(-10) + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculateEstimatedDelivery(estimatedDays) {
        if (estimatedDays === 'Hoy') {
            return new Date().toISOString();
        }

        // Extraer rango de días
        const days = estimatedDays.includes('-')
            ? parseInt(estimatedDays.split('-')[1])
            : parseInt(estimatedDays);

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);

        return deliveryDate.toISOString();
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    // ============================================
    // BANCOS PARA PSE
    // ============================================

    getPSEBanks() {
        return [
            { id: 'bancolombia', name: 'Bancolombia' },
            { id: 'banco-bogota', name: 'Banco de Bogotá' },
            { id: 'davivienda', name: 'Davivienda' },
            { id: 'bbva', name: 'BBVA Colombia' },
            { id: 'banco-occidente', name: 'Banco de Occidente' },
            { id: 'banco-popular', name: 'Banco Popular' },
            { id: 'colpatria', name: 'Scotiabank Colpatria' },
            { id: 'av-villas', name: 'Banco AV Villas' },
            { id: 'banco-caja-social', name: 'Banco Caja Social' },
            { id: 'banco-agrario', name: 'Banco Agrario' }
        ];
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.CheckoutSystem = CheckoutSystem;
}
