// AI Engine - Sistema de Inteligencia Artificial Avanzada v6.0
// Motor de IA conversacional con contexto y aprendizaje

class AIEngine {
    constructor() {
        this.context = {
            userPreferences: this.loadPreferences(),
            conversationHistory: [],
            userProfile: {
                name: null,
                favoritesBrands: [],
                priceRange: { min: 0, max: 1000000 },
                searchPatterns: [],
                purchaseHistory: [],
                level: 1,
                points: 0,
                achievements: []
            }
        };
        this.initializeAI();
    }

    initializeAI() {
        // Cargar perfil de usuario
        const savedProfile = localStorage.getItem('chatbot_user_profile');
        if (savedProfile) {
            this.context.userProfile = { ...this.context.userProfile, ...JSON.parse(savedProfile) };
        }
    }

    // Sistema de procesamiento de lenguaje natural
    processNaturalLanguage(input) {
        const lowerInput = input.toLowerCase();

        // Detectar intención del usuario
        const intent = this.detectIntent(lowerInput);

        // Extraer entidades
        const entities = this.extractEntities(lowerInput);

        // Generar respuesta contextual
        const response = this.generateContextualResponse(intent, entities);

        // Actualizar contexto
        this.updateContext(input, intent, entities);

        return response;
    }

    detectIntent(input) {
        const intents = {
            greeting: /^(hola|buenos días|buenas tardes|hey|saludos)/i,
            search: /(buscar|necesito|quiero|estoy buscando|me interesa)/i,
            compare: /(comparar|diferencia|cual es mejor|vs|versus)/i,
            price: /(precio|costo|cuanto cuesta|valor|económico|barato)/i,
            recommendation: /(recomienda|sugerir|aconsejar|mejor opción)/i,
            help: /(ayuda|como|explicar|no entiendo)/i,
            cart: /(carrito|agregar|comprar|pedido)/i,
            favorites: /(favorito|guardar|me gusta)/i
        };

        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(input)) {
                return intent;
            }
        }

        return 'general';
    }

    extractEntities(input) {
        const entities = {
            brands: [],
            categories: [],
            priceRange: null,
            models: []
        };

        // Detectar marcas
        const brands = ['auteco', 'akt', 'tvs', 'boxer'];
        brands.forEach(brand => {
            if (input.includes(brand)) {
                entities.brands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
            }
        });

        // Detectar categorías
        const categories = {
            'motor': ['motor', 'pistón', 'cilindro', 'bujía'],
            'frenos': ['freno', 'pastilla', 'disco'],
            'suspension': ['suspensión', 'amortiguador', 'resorte'],
            'electrico': ['batería', 'regulador', 'bobina', 'cdi'],
            'transmision': ['cadena', 'piñón', 'corona', 'embrague']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                entities.categories.push(category);
            }
        }

        // Detectar rango de precios
        const priceMatch = input.match(/(\d+)\s*(mil|k)?/);
        if (priceMatch) {
            const value = parseInt(priceMatch[1]);
            const multiplier = priceMatch[2] ? 1000 : 1;
            entities.priceRange = value * multiplier;
        }

        return entities;
    }

    generateContextualResponse(intent, entities) {
        const responses = {
            greeting: [
                `¡Hola! 👋 Veo que ya has buscado ${this.context.userProfile.searchPatterns.length} productos. ¿En qué puedo ayudarte hoy?`,
                `¡Bienvenido de nuevo! 🌟 Tienes ${this.context.userProfile.points} puntos acumulados. ¿Qué necesitas?`,
                `¡Hola! 😊 ¿Listo para encontrar el repuesto perfecto?`
            ],
            search: [
                `Entiendo que buscas ${entities.categories.join(', ')}. Te mostraré las mejores opciones.`,
                `Perfecto, vamos a buscar ${entities.brands.length > 0 ? 'en ' + entities.brands.join(' y ') : 'en todas las marcas'}.`
            ],
            compare: [
                `Excelente idea comparar productos. Te prepararé una tabla comparativa detallada.`,
                `Vamos a comparar características, precios y ratings para que tomes la mejor decisión.`
            ],
            recommendation: [
                `Basándome en tu historial, te recomiendo estos productos que podrían interesarte.`,
                `Tengo algunas sugerencias personalizadas para ti.`
            ]
        };

        const intentResponses = responses[intent] || [`Entendido, déjame ayudarte con eso.`];
        return intentResponses[Math.floor(Math.random() * intentResponses.length)];
    }

    updateContext(input, intent, entities) {
        this.context.conversationHistory.push({
            input,
            intent,
            entities,
            timestamp: new Date().toISOString()
        });

        // Mantener solo las últimas 10 interacciones
        if (this.context.conversationHistory.length > 10) {
            this.context.conversationHistory.shift();
        }

        // Actualizar patrones de búsqueda
        if (entities.brands.length > 0) {
            entities.brands.forEach(brand => {
                if (!this.context.userProfile.favoritesBrands.includes(brand)) {
                    this.context.userProfile.favoritesBrands.push(brand);
                }
            });
        }

        this.saveProfile();
    }

    // Sistema de recomendaciones inteligentes
    getRecommendations(currentProduct) {
        const recommendations = [];

        // Recomendaciones basadas en categoría
        if (currentProduct && currentProduct.category) {
            recommendations.push({
                type: 'category',
                reason: 'Productos relacionados de la misma categoría',
                products: this.findRelatedByCategory(currentProduct)
            });
        }

        // Recomendaciones basadas en precio
        recommendations.push({
            type: 'price',
            reason: 'Alternativas en tu rango de precio',
            products: this.findByPriceRange(this.context.userProfile.priceRange)
        });

        // Recomendaciones basadas en popularidad
        recommendations.push({
            type: 'popular',
            reason: 'Los más vendidos',
            products: this.getMostPopular()
        });

        return recommendations;
    }

    findRelatedByCategory(product) {
        // Implementación simplificada - en producción conectaría con la base de datos
        return [];
    }

    findByPriceRange(range) {
        return [];
    }

    getMostPopular() {
        return [];
    }

    // Sistema de gamificación
    addPoints(points, reason) {
        this.context.userProfile.points += points;

        // Verificar logros
        this.checkAchievements();

        // Actualizar nivel
        this.updateLevel();

        this.saveProfile();

        return {
            points: this.context.userProfile.points,
            level: this.context.userProfile.level,
            newAchievement: null
        };
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_search',
                name: 'Primer Búsqueda',
                description: 'Realizaste tu primera búsqueda',
                icon: '🔍',
                condition: () => this.context.conversationHistory.length >= 1,
                points: 10
            },
            {
                id: 'comparator',
                name: 'Comparador Experto',
                description: 'Comparaste 5 productos',
                icon: '⚖️',
                condition: () => this.context.userProfile.searchPatterns.filter(p => p.includes('compare')).length >= 5,
                points: 50
            },
            {
                id: 'shopper',
                name: 'Comprador Frecuente',
                description: 'Agregaste 10 productos al carrito',
                icon: '🛒',
                condition: () => this.context.userProfile.purchaseHistory.length >= 10,
                points: 100
            },
            {
                id: 'voice_user',
                name: 'Usuario de Voz',
                description: 'Usaste el chat por voz',
                icon: '🎤',
                condition: () => this.context.userProfile.searchPatterns.some(p => p.includes('voice')),
                points: 25
            }
        ];

        achievements.forEach(achievement => {
            if (!this.context.userProfile.achievements.includes(achievement.id) && achievement.condition()) {
                this.context.userProfile.achievements.push(achievement.id);
                this.addPoints(achievement.points, achievement.name);
                this.showAchievementUnlocked(achievement);
            }
        });
    }

    showAchievementUnlocked(achievement) {
        // Mostrar notificación especial de logro
        if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification(
                `🏆 ¡Logro Desbloqueado! ${achievement.icon} ${achievement.name} (+${achievement.points} pts)`,
                'success'
            );
        }
    }

    updateLevel() {
        const pointsForNextLevel = this.context.userProfile.level * 100;
        if (this.context.userProfile.points >= pointsForNextLevel) {
            this.context.userProfile.level++;
            if (typeof window !== 'undefined' && window.showNotification) {
                window.showNotification(
                    `🎉 ¡Nivel ${this.context.userProfile.level} Alcanzado!`,
                    'success'
                );
            }
        }
    }

    loadPreferences() {
        try {
            return JSON.parse(localStorage.getItem('chatbot_ai_preferences')) || {};
        } catch (e) {
            return {};
        }
    }

    saveProfile() {
        try {
            localStorage.setItem('chatbot_user_profile', JSON.stringify(this.context.userProfile));
            localStorage.setItem('chatbot_ai_preferences', JSON.stringify(this.context.userPreferences));
        } catch (e) {
            console.error('Error saving profile:', e);
        }
    }

    // Obtener estadísticas del usuario
    getUserStats() {
        return {
            level: this.context.userProfile.level,
            points: this.context.userProfile.points,
            achievements: this.context.userProfile.achievements.length,
            searches: this.context.conversationHistory.length,
            favoriteBrands: this.context.userProfile.favoritesBrands,
            purchaseHistory: this.context.userProfile.purchaseHistory.length
        };
    }
}

// Sistema de comparación de productos
class ProductComparator {
    constructor() {
        this.compareList = [];
        this.maxCompare = 4;
    }

    addToCompare(product) {
        if (this.compareList.length >= this.maxCompare) {
            return {
                success: false,
                message: `Solo puedes comparar hasta ${this.maxCompare} productos a la vez`
            };
        }

        if (this.compareList.find(p => p.name === product.name)) {
            return {
                success: false,
                message: 'Este producto ya está en la lista de comparación'
            };
        }

        this.compareList.push(product);
        return {
            success: true,
            message: `Producto agregado (${this.compareList.length}/${this.maxCompare})`
        };
    }

    removeFromCompare(productName) {
        this.compareList = this.compareList.filter(p => p.name !== productName);
    }

    getComparisonData() {
        if (this.compareList.length < 2) {
            return null;
        }

        const comparison = {
            products: this.compareList,
            metrics: {
                price: this.compareMetric('price'),
                rating: this.compareMetric('rating'),
                discount: this.compareMetric('discount'),
                stock: this.compareMetric('stock')
            },
            winner: this.calculateWinner()
        };

        return comparison;
    }

    compareMetric(metric) {
        const values = this.compareList.map(p => ({
            name: p.name,
            value: p[metric],
            normalized: 0
        }));

        // Normalizar valores
        const max = Math.max(...values.map(v => v.value));
        const min = Math.min(...values.map(v => v.value));

        values.forEach(v => {
            v.normalized = ((v.value - min) / (max - min || 1)) * 100;
        });

        return values;
    }

    calculateWinner() {
        // Algoritmo de puntuación
        const scores = this.compareList.map(product => {
            const priceScore = 100 - ((product.price / 500000) * 100);
            const ratingScore = (product.rating / 5) * 100;
            const discountScore = product.discount * 5;
            const stockScore = Math.min((product.stock / 50) * 100, 100);

            const totalScore = (priceScore * 0.3) + (ratingScore * 0.4) + (discountScore * 0.2) + (stockScore * 0.1);

            return {
                product,
                score: totalScore
            };
        });

        scores.sort((a, b) => b.score - a.score);
        return scores[0];
    }

    clearComparison() {
        this.compareList = [];
    }
}

// Sistema de cupones y promociones
class PromotionSystem {
    constructor() {
        this.activeCoupons = this.loadCoupons();
        this.promotions = this.initializePromotions();
    }

    initializePromotions() {
        return [
            {
                id: 'WELCOME10',
                code: 'WELCOME10',
                discount: 10,
                type: 'percentage',
                description: '10% de descuento en tu primera compra',
                validUntil: new Date('2025-12-31'),
                minPurchase: 50000,
                active: true
            },
            {
                id: 'MOTO20',
                code: 'MOTO20',
                discount: 20,
                type: 'percentage',
                description: '20% en repuestos de motor',
                validUntil: new Date('2025-11-30'),
                category: 'motor',
                active: true
            },
            {
                id: 'FREESHIPPING',
                code: 'ENVIOGRATIS',
                discount: 0,
                type: 'shipping',
                description: 'Envío gratis en compras superiores a $100.000',
                validUntil: new Date('2025-12-15'),
                minPurchase: 100000,
                active: true
            },
            {
                id: 'FLASH50',
                code: 'FLASH50',
                discount: 50000,
                type: 'fixed',
                description: '$50.000 de descuento (Oferta relámpago)',
                validUntil: new Date('2025-10-20'),
                minPurchase: 200000,
                active: true
            }
        ];
    }

    applyCoupon(code, cartTotal, category = null) {
        const coupon = this.promotions.find(p =>
            p.code.toUpperCase() === code.toUpperCase() &&
            p.active &&
            new Date(p.validUntil) > new Date()
        );

        if (!coupon) {
            return {
                success: false,
                message: 'Cupón inválido o expirado'
            };
        }

        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            return {
                success: false,
                message: `Compra mínima de ${this.formatPrice(coupon.minPurchase)} requerida`
            };
        }

        if (coupon.category && category !== coupon.category) {
            return {
                success: false,
                message: `Este cupón solo aplica para ${coupon.category}`
            };
        }

        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (cartTotal * coupon.discount) / 100;
        } else if (coupon.type === 'fixed') {
            discountAmount = coupon.discount;
        }

        return {
            success: true,
            coupon,
            discountAmount,
            newTotal: cartTotal - discountAmount
        };
    }

    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(price);
    }

    loadCoupons() {
        try {
            return JSON.parse(localStorage.getItem('chatbot_used_coupons')) || [];
        } catch (e) {
            return [];
        }
    }

    saveCoupons() {
        try {
            localStorage.setItem('chatbot_used_coupons', JSON.stringify(this.activeCoupons));
        } catch (e) {
            console.error('Error saving coupons:', e);
        }
    }

    getAllPromotions() {
        return this.promotions.filter(p => p.active && new Date(p.validUntil) > new Date());
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.AIEngine = AIEngine;
    window.ProductComparator = ProductComparator;
    window.PromotionSystem = PromotionSystem;
}
