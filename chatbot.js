// Base de datos de marcas colombianas de motos y sus repuestos (Versión Mejorada 5.0)
const motorcycleData = {
    brands: {
        "Auteco": {
            models: ["Discover 125", "Pulsar NS 200", "Pulsar NS 160", "Victory 100"],
            commonParts: {
                motor: [
                    { name: "Kit de arrastre", price: 120000, discount: 10, rating: 4.5, stock: 15, image: "🔧" },
                    { name: "Filtro de aceite", price: 25000, discount: 0, rating: 4.8, stock: 30, image: "🛢️" },
                    { name: "Bujía NGK", price: 18000, discount: 5, rating: 4.9, stock: 50, image: "⚡" },
                    { name: "Empaque de motor", price: 35000, discount: 0, rating: 4.3, stock: 20, image: "📦" },
                    { name: "Pistón completo", price: 180000, discount: 15, rating: 4.7, stock: 8, image: "⚙️" }
                ],
                suspension: [
                    { name: "Amortiguador delantero", price: 250000, discount: 10, rating: 4.6, stock: 10, image: "🔩" },
                    { name: "Amortiguador trasero", price: 280000, discount: 12, rating: 4.7, stock: 8, image: "🔩" },
                    { name: "Resortes progresivos", price: 95000, discount: 0, rating: 4.4, stock: 15, image: "🌀" },
                    { name: "Horquilla completa", price: 450000, discount: 20, rating: 4.8, stock: 5, image: "🔧" }
                ],
                frenos: [
                    { name: "Pastillas de freno delanteras", price: 65000, discount: 8, rating: 4.6, stock: 25, image: "🛑" },
                    { name: "Pastillas de freno traseras", price: 55000, discount: 8, rating: 4.5, stock: 25, image: "🛑" },
                    { name: "Disco de freno", price: 120000, discount: 15, rating: 4.7, stock: 12, image: "💿" },
                    { name: "Cable de freno", price: 22000, discount: 0, rating: 4.3, stock: 35, image: "🔗" }
                ],
                electrico: [
                    { name: "Batería 12V", price: 180000, discount: 10, rating: 4.5, stock: 18, image: "🔋" },
                    { name: "Regulador de voltaje", price: 85000, discount: 5, rating: 4.4, stock: 12, image: "⚡" },
                    { name: "Bobina de encendido", price: 95000, discount: 0, rating: 4.6, stock: 20, image: "⚡" },
                    { name: "CDI digital", price: 120000, discount: 12, rating: 4.7, stock: 15, image: "💻" },
                    { name: "Switch de encendido", price: 45000, discount: 0, rating: 4.2, stock: 22, image: "🔑" }
                ],
                transmision: [
                    { name: "Cadena reforzada", price: 85000, discount: 10, rating: 4.6, stock: 20, image: "🔗" },
                    { name: "Piñón de ataque", price: 45000, discount: 5, rating: 4.5, stock: 25, image: "⚙️" },
                    { name: "Corona trasera", price: 75000, discount: 5, rating: 4.5, stock: 25, image: "⚙️" },
                    { name: "Embrague completo", price: 320000, discount: 18, rating: 4.8, stock: 6, image: "🔧" },
                    { name: "Cable de clutch", price: 28000, discount: 0, rating: 4.3, stock: 30, image: "🔗" }
                ],
                otros: [
                    { name: "Llanta delantera", price: 180000, discount: 12, rating: 4.6, stock: 10, image: "⭕" },
                    { name: "Llanta trasera", price: 220000, discount: 12, rating: 4.6, stock: 10, image: "⭕" },
                    { name: "Filtro de aire deportivo", price: 65000, discount: 8, rating: 4.7, stock: 18, image: "🌬️" },
                    { name: "Espejos retrovisores", price: 45000, discount: 0, rating: 4.4, stock: 28, image: "🪞" },
                    { name: "Maniguetas", price: 95000, discount: 10, rating: 4.5, stock: 15, image: "✋" }
                ]
            }
        },
        "AKT": {
            models: ["NKD 125", "TTR 200", "CR5 180", "AK 125"],
            commonParts: {
                motor: [
                    { name: "Kit de arrastre", price: 115000, discount: 8, rating: 4.4, stock: 12, image: "🔧" },
                    { name: "Filtro de aceite", price: 22000, discount: 0, rating: 4.7, stock: 35, image: "🛢️" },
                    { name: "Bujía", price: 16000, discount: 0, rating: 4.6, stock: 45, image: "⚡" },
                    { name: "Empaque de motor", price: 32000, discount: 5, rating: 4.3, stock: 18, image: "📦" },
                    { name: "Pistón", price: 165000, discount: 12, rating: 4.6, stock: 10, image: "⚙️" },
                    { name: "Cilindro", price: 280000, discount: 15, rating: 4.7, stock: 6, image: "⚙️" }
                ],
                suspension: [
                    { name: "Amortiguador delantero", price: 235000, discount: 10, rating: 4.5, stock: 9, image: "🔩" },
                    { name: "Amortiguador trasero", price: 265000, discount: 10, rating: 4.6, stock: 8, image: "🔩" },
                    { name: "Resortes", price: 88000, discount: 0, rating: 4.3, stock: 14, image: "🌀" }
                ],
                frenos: [
                    { name: "Pastillas de freno", price: 58000, discount: 5, rating: 4.5, stock: 22, image: "🛑" },
                    { name: "Disco de freno", price: 115000, discount: 12, rating: 4.6, stock: 14, image: "💿" },
                    { name: "Bomba de freno", price: 145000, discount: 10, rating: 4.7, stock: 8, image: "🔧" },
                    { name: "Cable de freno", price: 20000, discount: 0, rating: 4.2, stock: 32, image: "🔗" }
                ],
                electrico: [
                    { name: "Batería", price: 165000, discount: 8, rating: 4.4, stock: 16, image: "🔋" },
                    { name: "Regulador", price: 78000, discount: 0, rating: 4.3, stock: 14, image: "⚡" },
                    { name: "Bobina", price: 88000, discount: 5, rating: 4.5, stock: 18, image: "⚡" },
                    { name: "Estator", price: 195000, discount: 15, rating: 4.6, stock: 7, image: "⚡" },
                    { name: "Rectificador", price: 125000, discount: 10, rating: 4.5, stock: 11, image: "💻" }
                ],
                transmision: [
                    { name: "Cadena", price: 78000, discount: 8, rating: 4.5, stock: 22, image: "🔗" },
                    { name: "Piñón", price: 42000, discount: 0, rating: 4.4, stock: 26, image: "⚙️" },
                    { name: "Corona", price: 72000, discount: 5, rating: 4.4, stock: 26, image: "⚙️" },
                    { name: "Embrague", price: 295000, discount: 15, rating: 4.7, stock: 7, image: "🔧" }
                ],
                otros: [
                    { name: "Llanta delantera", price: 165000, discount: 10, rating: 4.5, stock: 11, image: "⭕" },
                    { name: "Llanta trasera", price: 205000, discount: 10, rating: 4.5, stock: 11, image: "⭕" },
                    { name: "Filtro de aire", price: 58000, discount: 5, rating: 4.6, stock: 20, image: "🌬️" },
                    { name: "Espejos", price: 42000, discount: 0, rating: 4.3, stock: 26, image: "🪞" }
                ]
            }
        },
        "TVS": {
            models: ["Apache RTR 160", "Apache RTR 200", "Sport 100"],
            commonParts: {
                motor: [
                    { name: "Filtro de aceite", price: 28000, discount: 5, rating: 4.7, stock: 28, image: "🛢️" },
                    { name: "Bujía Iridium", price: 22000, discount: 0, rating: 4.8, stock: 42, image: "⚡" },
                    { name: "Empaque de motor", price: 38000, discount: 0, rating: 4.4, stock: 16, image: "📦" },
                    { name: "Kit de pistón", price: 195000, discount: 15, rating: 4.7, stock: 8, image: "⚙️" }
                ],
                suspension: [
                    { name: "Amortiguador delantero", price: 268000, discount: 12, rating: 4.6, stock: 8, image: "🔩" },
                    { name: "Amortiguador trasero", price: 295000, discount: 12, rating: 4.7, stock: 7, image: "🔩" }
                ],
                frenos: [
                    { name: "Pastillas de freno delanteras", price: 72000, discount: 10, rating: 4.7, stock: 20, image: "🛑" },
                    { name: "Pastillas de freno traseras", price: 62000, discount: 10, rating: 4.6, stock: 20, image: "🛑" },
                    { name: "Disco de freno petal", price: 135000, discount: 15, rating: 4.8, stock: 10, image: "💿" }
                ],
                electrico: [
                    { name: "Batería Lithium", price: 220000, discount: 12, rating: 4.8, stock: 12, image: "🔋" },
                    { name: "Regulador de voltaje", price: 95000, discount: 5, rating: 4.5, stock: 10, image: "⚡" },
                    { name: "Bobina racing", price: 115000, discount: 8, rating: 4.7, stock: 14, image: "⚡" }
                ],
                transmision: [
                    { name: "Cadena O-Ring", price: 95000, discount: 10, rating: 4.7, stock: 18, image: "🔗" },
                    { name: "Piñón reforzado", price: 52000, discount: 5, rating: 4.6, stock: 22, image: "⚙️" },
                    { name: "Corona racing", price: 82000, discount: 5, rating: 4.6, stock: 22, image: "⚙️" },
                    { name: "Cable de clutch", price: 32000, discount: 0, rating: 4.4, stock: 28, image: "🔗" }
                ],
                otros: [
                    { name: "Filtro de aire K&N", price: 85000, discount: 12, rating: 4.8, stock: 15, image: "🌬️" },
                    { name: "Espejos deportivos", price: 58000, discount: 8, rating: 4.6, stock: 24, image: "🪞" },
                    { name: "Llantas racing", price: 450000, discount: 18, rating: 4.9, stock: 5, image: "⭕" }
                ]
            }
        },
        "Boxer": {
            models: ["BM 150", "BM 125", "CT 100"],
            commonParts: {
                motor: [
                    { name: "Kit de arrastre", price: 105000, discount: 5, rating: 4.3, stock: 14, image: "🔧" },
                    { name: "Filtro de aceite", price: 20000, discount: 0, rating: 4.6, stock: 38, image: "🛢️" },
                    { name: "Bujía", price: 15000, discount: 0, rating: 4.5, stock: 48, image: "⚡" },
                    { name: "Empaque de motor", price: 28000, discount: 0, rating: 4.2, stock: 22, image: "📦" }
                ],
                suspension: [
                    { name: "Amortiguador trasero", price: 195000, discount: 8, rating: 4.4, stock: 12, image: "🔩" },
                    { name: "Horquilla delantera", price: 385000, discount: 15, rating: 4.6, stock: 6, image: "🔧" }
                ],
                frenos: [
                    { name: "Pastillas de freno", price: 48000, discount: 5, rating: 4.4, stock: 26, image: "🛑" },
                    { name: "Cable de freno", price: 18000, discount: 0, rating: 4.2, stock: 35, image: "🔗" }
                ],
                electrico: [
                    { name: "Batería", price: 145000, discount: 5, rating: 4.3, stock: 18, image: "🔋" },
                    { name: "Regulador", price: 72000, discount: 0, rating: 4.2, stock: 16, image: "⚡" },
                    { name: "Bobina", price: 82000, discount: 5, rating: 4.4, stock: 20, image: "⚡" }
                ],
                transmision: [
                    { name: "Cadena", price: 68000, discount: 5, rating: 4.4, stock: 24, image: "🔗" },
                    { name: "Piñón", price: 38000, discount: 0, rating: 4.3, stock: 28, image: "⚙️" },
                    { name: "Corona", price: 65000, discount: 0, rating: 4.3, stock: 28, image: "⚙️" }
                ],
                otros: [
                    { name: "Filtro de aire", price: 48000, discount: 0, rating: 4.5, stock: 22, image: "🌬️" },
                    { name: "Espejos", price: 38000, discount: 0, rating: 4.2, stock: 28, image: "🪞" },
                    { name: "Llantas", price: 285000, discount: 10, rating: 4.5, stock: 8, image: "⭕" }
                ]
            }
        }
    }
};

class ChatBot {
    constructor() {
        this.conversationState = {
            step: 'greeting',
            selectedBrand: null,
            selectedModel: null,
            selectedCategory: null
        };
        this.favorites = this.loadFavorites();
        this.cart = this.loadCart();
        this.searchHistory = this.loadSearchHistory();
    }

    // Sistema de favoritos
    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem('chatbot_favorites')) || [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('chatbot_favorites', JSON.stringify(this.favorites));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }

    addToFavorites(part) {
        if (!this.favorites.find(p => p.name === part.name && p.brand === this.conversationState.selectedBrand)) {
            this.favorites.push({
                ...part,
                brand: this.conversationState.selectedBrand,
                model: this.conversationState.selectedModel,
                addedAt: new Date().toISOString()
            });
            this.saveFavorites();
            return true;
        }
        return false;
    }

    removeFromFavorites(partName) {
        this.favorites = this.favorites.filter(p => p.name !== partName);
        this.saveFavorites();
    }

    // Sistema de carrito de compras
    loadCart() {
        try {
            return JSON.parse(localStorage.getItem('chatbot_cart')) || [];
        } catch (e) {
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('chatbot_cart', JSON.stringify(this.cart));
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    addToCart(part, quantity = 1) {
        const existingItem = this.cart.find(p => p.name === part.name && p.brand === this.conversationState.selectedBrand);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...part,
                brand: this.conversationState.selectedBrand,
                model: this.conversationState.selectedModel,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        this.saveCart();
        return true;
    }

    removeFromCart(partName) {
        this.cart = this.cart.filter(p => p.name !== partName);
        this.saveCart();
    }

    getTotalCart() {
        return this.cart.reduce((total, item) => {
            const finalPrice = item.price * (1 - item.discount / 100);
            return total + (finalPrice * item.quantity);
        }, 0);
    }

    // Sistema de historial de búsqueda
    loadSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem('chatbot_search_history')) || [];
        } catch (e) {
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('chatbot_search_history', JSON.stringify(this.searchHistory.slice(-20)));
        } catch (e) {
            console.error('Error saving search history:', e);
        }
    }

    addToSearchHistory(query) {
        this.searchHistory.unshift({
            query: query,
            timestamp: new Date().toISOString()
        });
        this.saveSearchHistory();
    }

    // Búsqueda inteligente
    searchParts(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [brandName, brandData] of Object.entries(motorcycleData.brands)) {
            for (const [category, parts] of Object.entries(brandData.commonParts)) {
                parts.forEach(part => {
                    if (part.name.toLowerCase().includes(queryLower)) {
                        results.push({
                            ...part,
                            brand: brandName,
                            category: category
                        });
                    }
                });
            }
        }

        return results;
    }

    // Calcular precio final con descuento
    calculateFinalPrice(part) {
        return part.price * (1 - part.discount / 100);
    }

    // Formatear precio en pesos colombianos
    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    processMessage(userMessage) {
        const message = userMessage.toLowerCase().trim();

        switch(this.conversationState.step) {
            case 'greeting':
                return this.handleGreeting(message);
            case 'brand_selection':
                return this.handleBrandSelection(message);
            case 'model_selection':
                return this.handleModelSelection(message);
            case 'category_selection':
                return this.handleCategorySelection(message);
            case 'recommendation':
                return this.handleRecommendation(message);
            default:
                return this.reset();
        }
    }

    handleGreeting(message) {
        if (message.includes('hola') || message.includes('buenos') || message.includes('ayuda') || message === '') {
            this.conversationState.step = 'brand_selection';
            return {
                response: `¡Bienvenido al sistema de recomendación de repuestos para motos colombianas! 🏍️`,
                card: {
                    header: '¿Para qué marca de moto necesitas repuestos?',
                    text: 'Selecciona la marca de tu motocicleta:',
                    type: 'brand',
                    options: [
                        { label: 'Auteco', value: 'auteco', icon: '🏍️' },
                        { label: 'AKT', value: 'akt', icon: '🏍️' },
                        { label: 'TVS', value: 'tvs', icon: '🏍️' },
                        { label: 'Boxer', value: 'boxer', icon: '🏍️' }
                    ]
                },
                state: this.conversationState
            };
        }
        return {
            response: `¡Hola! Soy tu asistente para recomendación de repuestos de motos colombianas. Escribe "hola" para comenzar.`,
            state: this.conversationState
        };
    }

    handleBrandSelection(message) {
        const brands = Object.keys(motorcycleData.brands);
        let selectedBrand = null;

        // Buscar por número
        if (message === '1') selectedBrand = 'Auteco';
        else if (message === '2') selectedBrand = 'AKT';
        else if (message === '3') selectedBrand = 'TVS';
        else if (message === '4') selectedBrand = 'Boxer';
        // Buscar por nombre
        else {
            selectedBrand = brands.find(brand =>
                message.includes(brand.toLowerCase())
            );
        }

        if (selectedBrand) {
            this.conversationState.selectedBrand = selectedBrand;
            this.conversationState.step = 'model_selection';

            const models = motorcycleData.brands[selectedBrand].models;
            const modelOptions = models.map(model => ({
                label: model,
                value: model.toLowerCase(),
                icon: '🏍️'
            }));

            return {
                response: `Excelente, seleccionaste ${selectedBrand}.`,
                card: {
                    header: `¿Qué modelo de ${selectedBrand} tienes?`,
                    text: 'Selecciona tu modelo:',
                    type: 'model',
                    options: modelOptions
                },
                state: this.conversationState
            };
        }

        return {
            card: {
                header: 'Marca no reconocida',
                text: 'Por favor selecciona una de las siguientes marcas:',
                type: 'brand',
                options: [
                    { label: 'Auteco', value: 'auteco', icon: '🏍️' },
                    { label: 'AKT', value: 'akt', icon: '🏍️' },
                    { label: 'TVS', value: 'tvs', icon: '🏍️' },
                    { label: 'Boxer', value: 'boxer', icon: '🏍️' }
                ]
            },
            state: this.conversationState
        };
    }

    handleModelSelection(message) {
        const models = motorcycleData.brands[this.conversationState.selectedBrand].models;
        let selectedModel = null;

        // Buscar por número
        const modelIndex = parseInt(message) - 1;
        if (modelIndex >= 0 && modelIndex < models.length) {
            selectedModel = models[modelIndex];
        } else {
            // Buscar por nombre
            selectedModel = models.find(model =>
                message.includes(model.toLowerCase())
            );
        }

        if (selectedModel) {
            this.conversationState.selectedModel = selectedModel;
            this.conversationState.step = 'category_selection';

            return {
                response: `Perfecto, tienes una ${this.conversationState.selectedBrand} ${selectedModel}.`,
                card: {
                    header: '¿Qué tipo de repuesto necesitas?',
                    text: 'Selecciona la categoría:',
                    type: 'category',
                    options: [
                        { label: 'Motor', value: 'motor', icon: '⚙️' },
                        { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                        { label: 'Frenos', value: 'frenos', icon: '🛑' },
                        { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                        { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                        { label: 'Otros', value: 'otros', icon: '🔩' }
                    ]
                },
                state: this.conversationState
            };
        }

        const modelOptions = models.map(model => ({
            label: model,
            value: model.toLowerCase(),
            icon: '🏍️'
        }));

        return {
            card: {
                header: 'Modelo no reconocido',
                text: 'Por favor selecciona uno de los siguientes modelos:',
                type: 'model',
                options: modelOptions
            },
            state: this.conversationState
        };
    }

    handleCategorySelection(message) {
        const categoryMap = {
            '1': 'motor',
            '2': 'suspension',
            '3': 'frenos',
            '4': 'electrico',
            '5': 'transmision',
            '6': 'otros',
            'motor': 'motor',
            'suspension': 'suspension',
            'suspensión': 'suspension',
            'frenos': 'frenos',
            'freno': 'frenos',
            'electrico': 'electrico',
            'eléctrico': 'electrico',
            'transmision': 'transmision',
            'transmisión': 'transmision',
            'otros': 'otros',
            'otro': 'otros'
        };

        let selectedCategory = null;
        for (let key in categoryMap) {
            if (message.includes(key)) {
                selectedCategory = categoryMap[key];
                break;
            }
        }

        if (selectedCategory) {
            this.conversationState.selectedCategory = selectedCategory;
            this.conversationState.step = 'recommendation';

            const parts = motorcycleData.brands[this.conversationState.selectedBrand].commonParts[selectedCategory];
            const categoryNames = {
                motor: 'Motor',
                suspension: 'Suspensión',
                frenos: 'Frenos',
                electrico: 'Sistema Eléctrico',
                transmision: 'Transmisión',
                otros: 'Otros'
            };

            return {
                response: `Repuestos recomendados para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}:`,
                card: {
                    header: `Repuestos de ${categoryNames[selectedCategory]}`,
                    text: `Para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}:`,
                    parts: parts,
                    partsEnhanced: true, // Nueva bandera para usar formato mejorado
                    actions: [
                        { label: '🛒 Ver Carrito', value: 'ver carrito', type: 'info' },
                        { label: '❤️ Ver Favoritos', value: 'ver favoritos', type: 'info' },
                        { label: '🔍 Buscar otra categoría', value: 'si', type: 'primary' },
                        { label: '🔄 Reiniciar', value: 'reiniciar', type: 'secondary' }
                    ]
                },
                state: this.conversationState
            };
        }

        return {
            card: {
                header: 'Categoría no reconocida',
                text: 'Por favor selecciona una de las siguientes categorías:',
                type: 'category',
                options: [
                    { label: 'Motor', value: 'motor', icon: '⚙️' },
                    { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                    { label: 'Frenos', value: 'frenos', icon: '🛑' },
                    { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                    { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                    { label: 'Otros', value: 'otros', icon: '🔩' }
                ]
            },
            state: this.conversationState
        };
    }

    handleRecommendation(message) {
        if (message.includes('si') || message.includes('sí') || message.includes('otra')) {
            this.conversationState.step = 'category_selection';
            return {
                response: `¿Qué otra categoría necesitas para tu ${this.conversationState.selectedBrand} ${this.conversationState.selectedModel}?`,
                card: {
                    header: 'Selecciona otra categoría',
                    text: 'Elige la categoría de repuestos:',
                    type: 'category',
                    options: [
                        { label: 'Motor', value: 'motor', icon: '⚙️' },
                        { label: 'Suspensión', value: 'suspension', icon: '🔧' },
                        { label: 'Frenos', value: 'frenos', icon: '🛑' },
                        { label: 'Sistema Eléctrico', value: 'electrico', icon: '⚡' },
                        { label: 'Transmisión', value: 'transmision', icon: '🔗' },
                        { label: 'Otros', value: 'otros', icon: '🔩' }
                    ]
                },
                state: this.conversationState
            };
        } else if (message.includes('reiniciar') || message.includes('no')) {
            return this.reset();
        }

        return {
            card: {
                header: '¿Qué deseas hacer?',
                text: 'Selecciona una opción:',
                actions: [
                    { label: 'Buscar otra categoría', value: 'si', type: 'primary' },
                    { label: 'Reiniciar', value: 'reiniciar', type: 'secondary' }
                ]
            },
            state: this.conversationState
        };
    }

    reset() {
        this.conversationState = {
            step: 'greeting',
            selectedBrand: null,
            selectedModel: null,
            selectedCategory: null
        };
        return this.handleGreeting('hola');
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.ChatBot = ChatBot;
}
