// Internationalization System (i18n) - Sistema Multi-Idioma v9.0
// Soporte para múltiples idiomas con traducción dinámica

class I18nSystem {
    constructor() {
        this.currentLanguage = this.loadLanguagePreference() || this.detectLanguage();
        this.translations = this.loadTranslations();
        this.dateFormats = this.getDateFormats();
        this.numberFormats = this.getNumberFormats();
        this.currencies = this.getCurrencies();
    }

    // ============================================
    // DETECCIÓN Y CONFIGURACIÓN DE IDIOMA
    // ============================================

    detectLanguage() {
        // Detectar idioma del navegador
        const browserLang = navigator.language || navigator.userLanguage;

        // Mapear a idiomas soportados
        if (browserLang.startsWith('es')) return 'es';
        if (browserLang.startsWith('en')) return 'en';
        if (browserLang.startsWith('pt')) return 'pt';
        if (browserLang.startsWith('fr')) return 'fr';

        return 'es'; // Default: español
    }

    loadLanguagePreference() {
        return localStorage.getItem('i18n_language');
    }

    setLanguage(langCode) {
        if (!this.translations[langCode]) {
            console.error('Idioma no soportado:', langCode);
            return false;
        }

        this.currentLanguage = langCode;
        localStorage.setItem('i18n_language', langCode);

        // Actualizar atributo HTML lang
        document.documentElement.setAttribute('lang', langCode);

        // Disparar evento de cambio de idioma
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: langCode } }));

        return true;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return Object.keys(this.translations).map(code => ({
            code,
            name: this.translations[code]._meta.name,
            nativeName: this.translations[code]._meta.nativeName,
            flag: this.translations[code]._meta.flag
        }));
    }

    // ============================================
    // TRADUCCIONES
    // ============================================

    loadTranslations() {
        return {
            es: {
                _meta: {
                    name: 'Spanish',
                    nativeName: 'Español',
                    flag: '🇪🇸',
                    direction: 'ltr'
                },

                // Navegación y UI
                nav: {
                    home: 'Inicio',
                    products: 'Productos',
                    cart: 'Carrito',
                    favorites: 'Favoritos',
                    orders: 'Pedidos',
                    profile: 'Perfil',
                    admin: 'Administración',
                    logout: 'Cerrar Sesión'
                },

                // Autenticación
                auth: {
                    login: 'Iniciar Sesión',
                    register: 'Registrarse',
                    logout: 'Cerrar Sesión',
                    username: 'Usuario',
                    email: 'Correo Electrónico',
                    password: 'Contraseña',
                    confirmPassword: 'Confirmar Contraseña',
                    forgotPassword: '¿Olvidaste tu contraseña?',
                    rememberMe: 'Recordarme',
                    createAccount: 'Crear Cuenta',
                    fullName: 'Nombre Completo',
                    phone: 'Teléfono'
                },

                // Productos
                products: {
                    name: 'Nombre',
                    brand: 'Marca',
                    category: 'Categoría',
                    price: 'Precio',
                    discount: 'Descuento',
                    stock: 'Stock',
                    rating: 'Calificación',
                    addToCart: 'Agregar al Carrito',
                    addToFavorites: 'Agregar a Favoritos',
                    buyNow: 'Comprar Ahora',
                    outOfStock: 'Agotado',
                    lowStock: 'Pocas unidades',
                    description: 'Descripción',
                    specifications: 'Especificaciones',
                    reviews: 'Reseñas'
                },

                // Carrito
                cart: {
                    title: 'Carrito de Compras',
                    empty: 'Tu carrito está vacío',
                    item: 'artículo',
                    items: 'artículos',
                    subtotal: 'Subtotal',
                    shipping: 'Envío',
                    total: 'Total',
                    checkout: 'Finalizar Compra',
                    continueShopping: 'Continuar Comprando',
                    remove: 'Eliminar',
                    quantity: 'Cantidad',
                    update: 'Actualizar'
                },

                // Checkout
                checkout: {
                    title: 'Finalizar Compra',
                    step1: 'Envío',
                    step2: 'Pago',
                    step3: 'Confirmar',
                    shippingAddress: 'Dirección de Envío',
                    shippingMethod: 'Método de Envío',
                    paymentMethod: 'Método de Pago',
                    orderSummary: 'Resumen del Pedido',
                    placeOrder: 'Realizar Pedido',
                    processing: 'Procesando...'
                },

                // Pedidos
                orders: {
                    title: 'Mis Pedidos',
                    orderNumber: 'Número de Pedido',
                    date: 'Fecha',
                    status: 'Estado',
                    total: 'Total',
                    details: 'Ver Detalles',
                    track: 'Rastrear',
                    cancel: 'Cancelar',
                    statuses: {
                        pending: 'Pendiente',
                        confirmed: 'Confirmado',
                        preparing: 'En Preparación',
                        shipped: 'Enviado',
                        in_transit: 'En Tránsito',
                        out_for_delivery: 'En Reparto',
                        delivered: 'Entregado',
                        cancelled: 'Cancelado'
                    }
                },

                // Reviews
                reviews: {
                    title: 'Reseñas y Calificaciones',
                    write: 'Escribir Reseña',
                    rating: 'Calificación',
                    comment: 'Comentario',
                    submit: 'Enviar Reseña',
                    helpful: 'Útil',
                    notHelpful: 'No útil',
                    report: 'Reportar',
                    verified: 'Compra Verificada'
                },

                // Mensajes
                messages: {
                    success: 'Éxito',
                    error: 'Error',
                    warning: 'Advertencia',
                    info: 'Información',
                    addedToCart: 'Producto agregado al carrito',
                    removedFromCart: 'Producto eliminado del carrito',
                    addedToFavorites: 'Agregado a favoritos',
                    removedFromFavorites: 'Eliminado de favoritos',
                    loginRequired: 'Debes iniciar sesión',
                    orderPlaced: 'Pedido realizado exitosamente',
                    loading: 'Cargando...',
                    noResults: 'No se encontraron resultados'
                },

                // Botones comunes
                buttons: {
                    save: 'Guardar',
                    cancel: 'Cancelar',
                    delete: 'Eliminar',
                    edit: 'Editar',
                    close: 'Cerrar',
                    back: 'Volver',
                    next: 'Siguiente',
                    previous: 'Anterior',
                    search: 'Buscar',
                    filter: 'Filtrar',
                    export: 'Exportar',
                    import: 'Importar',
                    share: 'Compartir'
                },

                // Chatbot
                chatbot: {
                    welcome: '¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte?',
                    placeholder: 'Escribe tu mensaje aquí...',
                    greeting: 'Hola',
                    help: 'Ayuda',
                    restart: 'Reiniciar',
                    voiceInput: 'Entrada por voz',
                    clearChat: 'Limpiar chat'
                }
            },

            en: {
                _meta: {
                    name: 'English',
                    nativeName: 'English',
                    flag: '🇺🇸',
                    direction: 'ltr'
                },

                nav: {
                    home: 'Home',
                    products: 'Products',
                    cart: 'Cart',
                    favorites: 'Favorites',
                    orders: 'Orders',
                    profile: 'Profile',
                    admin: 'Admin',
                    logout: 'Logout'
                },

                auth: {
                    login: 'Login',
                    register: 'Register',
                    logout: 'Logout',
                    username: 'Username',
                    email: 'Email',
                    password: 'Password',
                    confirmPassword: 'Confirm Password',
                    forgotPassword: 'Forgot Password?',
                    rememberMe: 'Remember Me',
                    createAccount: 'Create Account',
                    fullName: 'Full Name',
                    phone: 'Phone'
                },

                products: {
                    name: 'Name',
                    brand: 'Brand',
                    category: 'Category',
                    price: 'Price',
                    discount: 'Discount',
                    stock: 'Stock',
                    rating: 'Rating',
                    addToCart: 'Add to Cart',
                    addToFavorites: 'Add to Favorites',
                    buyNow: 'Buy Now',
                    outOfStock: 'Out of Stock',
                    lowStock: 'Low Stock',
                    description: 'Description',
                    specifications: 'Specifications',
                    reviews: 'Reviews'
                },

                cart: {
                    title: 'Shopping Cart',
                    empty: 'Your cart is empty',
                    item: 'item',
                    items: 'items',
                    subtotal: 'Subtotal',
                    shipping: 'Shipping',
                    total: 'Total',
                    checkout: 'Checkout',
                    continueShopping: 'Continue Shopping',
                    remove: 'Remove',
                    quantity: 'Quantity',
                    update: 'Update'
                },

                checkout: {
                    title: 'Checkout',
                    step1: 'Shipping',
                    step2: 'Payment',
                    step3: 'Confirm',
                    shippingAddress: 'Shipping Address',
                    shippingMethod: 'Shipping Method',
                    paymentMethod: 'Payment Method',
                    orderSummary: 'Order Summary',
                    placeOrder: 'Place Order',
                    processing: 'Processing...'
                },

                orders: {
                    title: 'My Orders',
                    orderNumber: 'Order Number',
                    date: 'Date',
                    status: 'Status',
                    total: 'Total',
                    details: 'View Details',
                    track: 'Track',
                    cancel: 'Cancel',
                    statuses: {
                        pending: 'Pending',
                        confirmed: 'Confirmed',
                        preparing: 'Preparing',
                        shipped: 'Shipped',
                        in_transit: 'In Transit',
                        out_for_delivery: 'Out for Delivery',
                        delivered: 'Delivered',
                        cancelled: 'Cancelled'
                    }
                },

                reviews: {
                    title: 'Reviews & Ratings',
                    write: 'Write Review',
                    rating: 'Rating',
                    comment: 'Comment',
                    submit: 'Submit Review',
                    helpful: 'Helpful',
                    notHelpful: 'Not Helpful',
                    report: 'Report',
                    verified: 'Verified Purchase'
                },

                messages: {
                    success: 'Success',
                    error: 'Error',
                    warning: 'Warning',
                    info: 'Information',
                    addedToCart: 'Product added to cart',
                    removedFromCart: 'Product removed from cart',
                    addedToFavorites: 'Added to favorites',
                    removedFromFavorites: 'Removed from favorites',
                    loginRequired: 'You must login',
                    orderPlaced: 'Order placed successfully',
                    loading: 'Loading...',
                    noResults: 'No results found'
                },

                buttons: {
                    save: 'Save',
                    cancel: 'Cancel',
                    delete: 'Delete',
                    edit: 'Edit',
                    close: 'Close',
                    back: 'Back',
                    next: 'Next',
                    previous: 'Previous',
                    search: 'Search',
                    filter: 'Filter',
                    export: 'Export',
                    import: 'Import',
                    share: 'Share'
                },

                chatbot: {
                    welcome: 'Hello! I\'m your virtual assistant. How can I help you?',
                    placeholder: 'Type your message here...',
                    greeting: 'Hello',
                    help: 'Help',
                    restart: 'Restart',
                    voiceInput: 'Voice Input',
                    clearChat: 'Clear Chat'
                }
            },

            pt: {
                _meta: {
                    name: 'Portuguese',
                    nativeName: 'Português',
                    flag: '🇧🇷',
                    direction: 'ltr'
                },

                nav: {
                    home: 'Início',
                    products: 'Produtos',
                    cart: 'Carrinho',
                    favorites: 'Favoritos',
                    orders: 'Pedidos',
                    profile: 'Perfil',
                    admin: 'Administração',
                    logout: 'Sair'
                },

                auth: {
                    login: 'Entrar',
                    register: 'Registrar',
                    logout: 'Sair',
                    username: 'Usuário',
                    email: 'E-mail',
                    password: 'Senha',
                    confirmPassword: 'Confirmar Senha',
                    forgotPassword: 'Esqueceu a senha?',
                    rememberMe: 'Lembrar-me',
                    createAccount: 'Criar Conta',
                    fullName: 'Nome Completo',
                    phone: 'Telefone'
                },

                // ... más traducciones en portugués
                buttons: {
                    save: 'Salvar',
                    cancel: 'Cancelar',
                    delete: 'Excluir',
                    edit: 'Editar',
                    close: 'Fechar',
                    back: 'Voltar',
                    next: 'Próximo',
                    previous: 'Anterior',
                    search: 'Buscar',
                    filter: 'Filtrar',
                    export: 'Exportar',
                    import: 'Importar',
                    share: 'Compartilhar'
                }
            },

            fr: {
                _meta: {
                    name: 'French',
                    nativeName: 'Français',
                    flag: '🇫🇷',
                    direction: 'ltr'
                },

                nav: {
                    home: 'Accueil',
                    products: 'Produits',
                    cart: 'Panier',
                    favorites: 'Favoris',
                    orders: 'Commandes',
                    profile: 'Profil',
                    admin: 'Administration',
                    logout: 'Déconnexion'
                },

                // ... más traducciones en francés
                buttons: {
                    save: 'Enregistrer',
                    cancel: 'Annuler',
                    delete: 'Supprimer',
                    edit: 'Modifier',
                    close: 'Fermer',
                    back: 'Retour',
                    next: 'Suivant',
                    previous: 'Précédent',
                    search: 'Rechercher',
                    filter: 'Filtrer',
                    export: 'Exporter',
                    import: 'Importer',
                    share: 'Partager'
                }
            }
        };
    }

    // ============================================
    // OBTENER TRADUCCIONES
    // ============================================

    t(key, params = {}) {
        // Traducir una clave (ej: 'nav.home', 'auth.login')
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (!translation || !translation[k]) {
                console.warn(`Traducción no encontrada: ${key} (${this.currentLanguage})`);
                return key;
            }
            translation = translation[k];
        }

        // Reemplazar parámetros {param}
        if (typeof translation === 'string') {
            return this.interpolate(translation, params);
        }

        return translation;
    }

    interpolate(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // ============================================
    // FORMATEO DE FECHAS Y NÚMEROS
    // ============================================

    getDateFormats() {
        return {
            es: {
                short: 'DD/MM/YYYY',
                long: 'D de MMMM de YYYY',
                time: 'HH:mm',
                dateTime: 'DD/MM/YYYY HH:mm'
            },
            en: {
                short: 'MM/DD/YYYY',
                long: 'MMMM D, YYYY',
                time: 'h:mm A',
                dateTime: 'MM/DD/YYYY h:mm A'
            },
            pt: {
                short: 'DD/MM/YYYY',
                long: 'D de MMMM de YYYY',
                time: 'HH:mm',
                dateTime: 'DD/MM/YYYY HH:mm'
            },
            fr: {
                short: 'DD/MM/YYYY',
                long: 'D MMMM YYYY',
                time: 'HH:mm',
                dateTime: 'DD/MM/YYYY HH:mm'
            }
        };
    }

    formatDate(date, format = 'short') {
        const d = new Date(date);
        const locale = this.getLocale();

        const options = {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            dateTime: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
        };

        return d.toLocaleDateString(locale, options[format]);
    }

    getNumberFormats() {
        return {
            es: { decimal: ',', thousand: '.' },
            en: { decimal: '.', thousand: ',' },
            pt: { decimal: ',', thousand: '.' },
            fr: { decimal: ',', thousand: ' ' }
        };
    }

    formatNumber(number, decimals = 0) {
        const locale = this.getLocale();
        return number.toLocaleString(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    getCurrencies() {
        return {
            es: { code: 'COP', symbol: '$', position: 'before' },
            en: { code: 'USD', symbol: '$', position: 'before' },
            pt: { code: 'BRL', symbol: 'R$', position: 'before' },
            fr: { code: 'EUR', symbol: '€', position: 'after' }
        };
    }

    formatCurrency(amount) {
        const currency = this.currencies[this.currentLanguage];
        const formatted = this.formatNumber(amount, 2);

        return currency.position === 'before'
            ? `${currency.symbol}${formatted}`
            : `${formatted}${currency.symbol}`;
    }

    getLocale() {
        const locales = {
            es: 'es-CO',
            en: 'en-US',
            pt: 'pt-BR',
            fr: 'fr-FR'
        };

        return locales[this.currentLanguage] || 'es-CO';
    }

    // ============================================
    // ACTUALIZACIÓN DINÁMICA DE UI
    // ============================================

    updatePageContent() {
        // Actualizar todos los elementos con atributo data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Actualizar placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Actualizar títulos (title attribute)
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
    }

    // ============================================
    // PLURALIZACIÓN
    // ============================================

    plural(key, count, params = {}) {
        const rules = {
            es: (n) => n === 1 ? 'one' : 'other',
            en: (n) => n === 1 ? 'one' : 'other',
            pt: (n) => n === 1 ? 'one' : 'other',
            fr: (n) => n <= 1 ? 'one' : 'other'
        };

        const rule = rules[this.currentLanguage] || rules.es;
        const form = rule(count);

        const translation = this.t(`${key}.${form}`, { ...params, count });

        return translation;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.I18nSystem = I18nSystem;

    // Inicializar automáticamente
    window.i18n = new I18nSystem();

    // Actualizar contenido al cambiar idioma
    window.addEventListener('languageChanged', () => {
        window.i18n.updatePageContent();
    });
}
