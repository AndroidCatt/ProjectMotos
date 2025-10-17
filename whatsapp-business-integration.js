/**
 * WhatsApp Business Integration v16.0
 * Integración completa con WhatsApp Business API
 *
 * Características:
 * - Envío de mensajes vía WhatsApp
 * - Compartir productos por WhatsApp
 * - Notificaciones de pedidos
 * - Chat directo con soporte
 * - Plantillas de mensajes
 * - Click-to-WhatsApp button
 * - QR Code para WhatsApp
 */

class WhatsAppBusinessIntegration {
    constructor() {
        this.businessPhone = '+573212018219'; // Número de WhatsApp Business
        this.apiToken = null; // TODO: Configurar token de WhatsApp Business API
        this.templates = this.loadTemplates();
        this.init();
    }

    init() {
        console.log('WhatsApp Business Integration v16.0 inicializado');
        this.setupButtons();
    }

    loadTemplates() {
        return {
            orderConfirmation: {
                name: 'order_confirmation',
                text: 'Hola {name}, tu pedido #{orderNumber} ha sido confirmado. Total: ${total}. Será entregado en {deliveryTime}.'
            },
            orderShipped: {
                name: 'order_shipped',
                text: 'Tu pedido #{orderNumber} ha sido despachado. Tracking: {tracking}'
            },
            stockAlert: {
                name: 'stock_alert',
                text: '¡{productName} está disponible nuevamente! Precio: ${price}'
            },
            welcome: {
                name: 'welcome',
                text: '¡Bienvenido a Repuestos Motos! 🏍️ Estoy aquí para ayudarte. ¿Qué repuesto necesitas?'
            }
        };
    }

    setupButtons() {
        // Agregar botones de WhatsApp en la UI
        this.addFloatingWhatsAppButton();
    }

    addFloatingWhatsAppButton() {
        if (document.getElementById('whatsapp-float-btn')) return;

        const btn = document.createElement('a');
        btn.id = 'whatsapp-float-btn';
        btn.className = 'whatsapp-float-btn';
        btn.href = this.getWhatsAppLink('Hola, necesito información sobre repuestos');
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.innerHTML = `
            <svg viewBox="0 0 32 32" width="32" height="32">
                <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.049-13.485 13.485-13.485s13.485 6.049 13.485 13.485c0 7.435-6.049 13.485-13.485 13.485z"/>
                <path fill="currentColor" d="M20.947 17.623c-0.329-0.167-1.945-0.959-2.245-1.069-0.3-0.11-0.518-0.167-0.736 0.167-0.218 0.333-0.842 1.069-1.032 1.287-0.19 0.218-0.38 0.245-0.709 0.078-0.329-0.167-1.388-0.513-2.644-1.634-0.977-0.873-1.637-1.95-1.827-2.279-0.19-0.329-0.020-0.507 0.145-0.672 0.149-0.148 0.329-0.385 0.494-0.577 0.165-0.192 0.22-0.329 0.329-0.549 0.11-0.22 0.055-0.412-0.027-0.577-0.083-0.165-0.736-1.775-1.009-2.432-0.266-0.639-0.537-0.553-0.736-0.563-0.19-0.009-0.408-0.011-0.626-0.011s-0.572 0.081-0.872 0.404c-0.3 0.323-1.145 1.119-1.145 2.73 0 1.61 1.173 3.166 1.337 3.384 0.164 0.218 2.282 3.665 5.592 5.021 3.31 1.356 3.31 0.903 3.906 0.847 0.596-0.056 1.923-0.786 2.194-1.544 0.271-0.758 0.271-1.408 0.190-1.544-0.082-0.137-0.3-0.219-0.629-0.386z"/>
            </svg>
            <span>Chat WhatsApp</span>
        `;

        document.body.appendChild(btn);
    }

    // ====================================
    // ENVIAR MENSAJES
    // ====================================

    getWhatsAppLink(message, phone = null) {
        const number = phone || this.businessPhone;
        const encoded = encodeURIComponent(message);
        return `https://wa.me/${number.replace(/\D/g, '')}?text=${encoded}`;
    }

    sendMessage(phone, message) {
        // Abrir WhatsApp con mensaje pre-cargado
        window.open(this.getWhatsAppLink(message, phone), '_blank');
    }

    sendTemplate(phone, templateName, params) {
        const template = this.templates[templateName];
        if (!template) {
            console.error('Template no encontrado:', templateName);
            return;
        }

        let message = template.text;

        // Reemplazar parámetros
        Object.entries(params).forEach(([key, value]) => {
            message = message.replace(`{${key}}`, value);
        });

        this.sendMessage(phone, message);
    }

    // ====================================
    // COMPARTIR PRODUCTO
    // ====================================

    shareProduct(product) {
        const message = `
🏍️ *${product.name}*

💰 Precio: $${typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
🏷️ Marca: ${product.brand || 'N/A'}
📦 Categoría: ${product.category || 'N/A'}

${product.description || ''}

¿Te interesa? ¡Pregúntame más detalles!

Ver en: ${window.location.href}
        `.trim();

        this.sendMessage(null, message);
    }

    shareCart(cartItems) {
        let message = '🛒 *Mi Carrito*\n\n';

        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name} - $${item.price} x${item.quantity}\n`;
        });

        const total = cartItems.reduce((sum, item) => {
            const price = typeof item.price === 'number' ? item.price : parseInt(item.price.replace(/\D/g, ''));
            return sum + (price * item.quantity);
        }, 0);

        message += `\n💰 *Total: $${total.toLocaleString()}*\n\n`;
        message += '¿Puedes ayudarme con este pedido?';

        this.sendMessage(null, message);
    }

    // ====================================
    // NOTIFICACIONES DE PEDIDOS
    // ====================================

    notifyOrderConfirmation(order) {
        const params = {
            name: order.customerName,
            orderNumber: order.id,
            total: order.total.toLocaleString(),
            deliveryTime: order.deliveryTime || '3-5 días hábiles'
        };

        this.sendTemplate(order.customerPhone, 'orderConfirmation', params);
    }

    notifyOrderShipped(order) {
        const params = {
            orderNumber: order.id,
            tracking: order.trackingNumber || 'N/A'
        };

        this.sendTemplate(order.customerPhone, 'orderShipped', params);
    }

    notifyStockAvailable(product, customerPhone) {
        const params = {
            productName: product.name,
            price: product.price.toLocaleString()
        };

        this.sendTemplate(customerPhone, 'stockAlert', params);
    }

    // ====================================
    // SOPORTE
    // ====================================

    contactSupport(issue = '') {
        const message = issue ?
            `Necesito ayuda con: ${issue}` :
            'Hola, necesito asistencia';

        this.sendMessage(null, message);
    }

    requestQuote(products) {
        let message = '💬 *Solicitud de Cotización*\n\n';
        message += 'Productos de interés:\n\n';

        products.forEach((product, index) => {
            message += `${index + 1}. ${product.name}\n`;
        });

        message += '\n¿Pueden enviarme una cotización con precios especiales?';

        this.sendMessage(null, message);
    }

    // ====================================
    // CLICK-TO-WHATSAPP BUTTON
    // ====================================

    addWhatsAppButton(elementId, message) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const btn = document.createElement('button');
        btn.className = 'btn-whatsapp';
        btn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 32 32">
                <path fill="currentColor" d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16z"/>
            </svg>
            <span>WhatsApp</span>
        `;

        btn.onclick = () => this.sendMessage(null, message);
        element.appendChild(btn);
    }

    // ====================================
    // QR CODE
    // ====================================

    generateWhatsAppQR(message) {
        const link = this.getWhatsAppLink(message);
        // En producción: usar librería de QR como qrcode.js
        console.log('QR Code para:', link);

        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    }

    showQRCode(message) {
        const qrUrl = this.generateWhatsAppQR(message);

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📱 Escanea con tu celular</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <p>Escanea este código QR con la cámara de tu celular</p>
                    <img src="${qrUrl}" alt="QR Code WhatsApp" style="max-width: 100%; margin: 20px 0;">
                    <p><small>O haz click en el botón de abajo desde tu celular</small></p>
                    <a href="${this.getWhatsAppLink(message)}" class="btn-primary" target="_blank">
                        Abrir WhatsApp
                    </a>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.appendChild(modal);
    }

    // ====================================
    // CONFIGURACIÓN
    // ====================================

    setBusinessPhone(phone) {
        this.businessPhone = phone;
        localStorage.setItem('whatsappBusinessPhone', phone);
    }

    getBusinessPhone() {
        return this.businessPhone;
    }

    setAPIToken(token) {
        this.apiToken = token;
        localStorage.setItem('whatsappAPIToken', token);
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.whatsappBusiness = new WhatsAppBusinessIntegration();
}
