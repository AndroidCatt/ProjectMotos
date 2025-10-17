// Training System - Sistema de Entrenamiento del Bot v8.0
// Permite entrenar y personalizar el chatbot sin modificar código

class TrainingSystem {
    constructor() {
        this.customResponses = this.loadCustomResponses();
        this.customIntents = this.loadCustomIntents();
        this.customProducts = this.loadCustomProducts();
        this.botPersonality = this.loadPersonality();
        this.conversationExamples = this.loadExamples();
    }

    // ============================================
    // RESPUESTAS PERSONALIZADAS
    // ============================================

    loadCustomResponses() {
        const saved = localStorage.getItem('bot_custom_responses');
        if (saved) return JSON.parse(saved);

        // Respuestas predeterminadas que puedes personalizar
        return {
            greeting: {
                patterns: ['hola', 'buenos días', 'buenas tardes', 'hey', 'saludos'],
                responses: [
                    '¡Hola! 👋 Bienvenido a Repuestos de Motos. ¿En qué puedo ayudarte hoy?',
                    '¡Buen día! 😊 ¿Buscas algún repuesto en particular?',
                    '¡Hola! Estoy aquí para ayudarte a encontrar los mejores repuestos para tu moto.'
                ],
                variableResponse: true // Alterna entre respuestas
            },
            thanks: {
                patterns: ['gracias', 'muchas gracias', 'thanks', 'te agradezco'],
                responses: [
                    '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
                    '¡Un placer ayudarte! ¿Necesitas algo más?',
                    '¡Para eso estoy! Si necesitas más ayuda, aquí estaré.'
                ]
            },
            goodbye: {
                patterns: ['adiós', 'chao', 'hasta luego', 'bye', 'nos vemos'],
                responses: [
                    '¡Hasta pronto! 👋 Vuelve cuando necesites más repuestos.',
                    '¡Adiós! Fue un gusto ayudarte. ¡Que tengas un excelente día! 😊',
                    '¡Hasta luego! No dudes en volver si necesitas algo más.'
                ]
            },
            help: {
                patterns: ['ayuda', 'help', 'no entiendo', 'qué puedes hacer'],
                responses: [
                    'Puedo ayudarte a:\n✅ Buscar repuestos por marca y modelo\n✅ Ver precios y disponibilidad\n✅ Agregar productos al carrito\n✅ Gestionar tus favoritos\n✅ Completar compras\n\nEscribe el nombre de una marca o dime qué repuesto necesitas.'
                ]
            },
            notFound: {
                patterns: [],
                responses: [
                    'No estoy seguro de haber entendido. ¿Podrías reformular tu pregunta?',
                    'Disculpa, no comprendo. ¿Buscas algún repuesto en particular?',
                    'No encontré información sobre eso. ¿Te gustaría que te muestre las marcas disponibles?'
                ]
            }
        };
    }

    saveCustomResponses() {
        localStorage.setItem('bot_custom_responses', JSON.stringify(this.customResponses));
    }

    addCustomResponse(intent, pattern, response) {
        if (!this.customResponses[intent]) {
            this.customResponses[intent] = {
                patterns: [],
                responses: []
            };
        }

        if (pattern && !this.customResponses[intent].patterns.includes(pattern.toLowerCase())) {
            this.customResponses[intent].patterns.push(pattern.toLowerCase());
        }

        if (response && !this.customResponses[intent].responses.includes(response)) {
            this.customResponses[intent].responses.push(response);
        }

        this.saveCustomResponses();
        return { success: true, message: 'Respuesta agregada exitosamente' };
    }

    getResponse(intent) {
        const intentData = this.customResponses[intent];
        if (!intentData || !intentData.responses.length) {
            return this.customResponses.notFound.responses[0];
        }

        if (intentData.variableResponse) {
            // Retorna una respuesta aleatoria
            return intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
        }

        return intentData.responses[0];
    }

    matchIntent(userInput) {
        const input = userInput.toLowerCase().trim();

        for (const [intent, data] of Object.entries(this.customResponses)) {
            if (intent === 'notFound') continue;

            for (const pattern of data.patterns) {
                if (input.includes(pattern)) {
                    return intent;
                }
            }
        }

        return 'notFound';
    }

    // ============================================
    // INTENTS PERSONALIZADOS (ACCIONES)
    // ============================================

    loadCustomIntents() {
        const saved = localStorage.getItem('bot_custom_intents');
        if (saved) return JSON.parse(saved);

        return {
            showPrices: {
                patterns: ['precio', 'costo', 'cuánto cuesta', 'valor'],
                action: 'filterByPrice',
                description: 'Muestra productos ordenados por precio'
            },
            showStock: {
                patterns: ['stock', 'disponibilidad', 'hay', 'tienen'],
                action: 'filterByStock',
                description: 'Filtra productos disponibles en stock'
            },
            showDeals: {
                patterns: ['ofertas', 'descuentos', 'promociones', 'rebaja'],
                action: 'filterByDiscount',
                description: 'Muestra productos con descuento'
            },
            showTopRated: {
                patterns: ['mejor calificado', 'mejor rating', 'mejores', 'top'],
                action: 'filterByRating',
                description: 'Muestra productos mejor calificados'
            }
        };
    }

    // ============================================
    // PRODUCTOS PERSONALIZADOS
    // ============================================

    loadCustomProducts() {
        const saved = localStorage.getItem('bot_custom_products');
        if (saved) return JSON.parse(saved);
        return [];
    }

    saveCustomProducts() {
        localStorage.setItem('bot_custom_products', JSON.stringify(this.customProducts));
    }

    addCustomProduct(productData) {
        const requiredFields = ['name', 'brand', 'category', 'price'];
        for (const field of requiredFields) {
            if (!productData[field]) {
                return { success: false, message: `Campo requerido: ${field}` };
            }
        }

        const newProduct = {
            id: 'custom_' + Date.now(),
            name: productData.name,
            brand: productData.brand,
            category: productData.category,
            model: productData.model || 'Universal',
            price: parseFloat(productData.price),
            discount: parseFloat(productData.discount) || 0,
            rating: parseFloat(productData.rating) || 4.0,
            stock: parseInt(productData.stock) || 10,
            image: productData.image || '🔧',
            description: productData.description || '',
            custom: true,
            createdAt: new Date().toISOString()
        };

        this.customProducts.push(newProduct);
        this.saveCustomProducts();

        return { success: true, message: 'Producto agregado', product: newProduct };
    }

    getCustomProducts() {
        return this.customProducts;
    }

    deleteCustomProduct(productId) {
        const index = this.customProducts.findIndex(p => p.id === productId);
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }

        this.customProducts.splice(index, 1);
        this.saveCustomProducts();
        return { success: true, message: 'Producto eliminado' };
    }

    // ============================================
    // PERSONALIDAD DEL BOT
    // ============================================

    loadPersonality() {
        const saved = localStorage.getItem('bot_personality');
        if (saved) return JSON.parse(saved);

        return {
            name: 'MotoBot',
            tone: 'friendly', // friendly, professional, casual, enthusiastic
            emoji: true,
            formality: 'informal', // formal, informal
            responseLength: 'medium', // short, medium, long
            useEmoji: true,
            language: 'es-CO',
            customization: {
                welcomeMessage: '¡Hola! Soy {botName}, tu asistente para repuestos de motos. ¿En qué puedo ayudarte?',
                errorMessage: 'Disculpa, no entendí eso. ¿Podrías reformularlo?',
                successMessage: '¡Listo! {action} completado correctamente.',
                loadingMessage: 'Buscando información...'
            }
        };
    }

    savePersonality() {
        localStorage.setItem('bot_personality', JSON.stringify(this.botPersonality));
    }

    updatePersonality(settings) {
        this.botPersonality = { ...this.botPersonality, ...settings };
        this.savePersonality();
        return { success: true, message: 'Personalidad actualizada' };
    }

    formatResponse(text, context = {}) {
        let formatted = text;

        // Reemplazar variables
        formatted = formatted.replace('{botName}', this.botPersonality.name);
        formatted = formatted.replace('{action}', context.action || 'la acción');

        // Ajustar emojis según configuración
        if (!this.botPersonality.useEmoji) {
            formatted = formatted.replace(/[^\w\s\.\,\!\?\-]/g, '');
        }

        // Ajustar tono
        if (this.botPersonality.tone === 'professional') {
            formatted = formatted.replace(/\!+/g, '.');
        }

        return formatted;
    }

    // ============================================
    // EJEMPLOS DE CONVERSACIÓN (TRAINING DATA)
    // ============================================

    loadExamples() {
        const saved = localStorage.getItem('bot_conversation_examples');
        if (saved) return JSON.parse(saved);

        return [
            {
                userInput: 'necesito un filtro de aceite para pulsar 125',
                intent: 'search',
                entities: {
                    productType: 'filtro de aceite',
                    model: 'pulsar 125'
                },
                expectedResponse: 'Tenemos filtros de aceite para Pulsar 125. Te muestro las opciones...'
            },
            {
                userInput: 'cuánto cuesta el kit de arrastre',
                intent: 'price_query',
                entities: {
                    productType: 'kit de arrastre'
                },
                expectedResponse: 'Los kits de arrastre tienen diferentes precios según la marca...'
            },
            {
                userInput: 'tienes llantas para AKT',
                intent: 'search',
                entities: {
                    productType: 'llantas',
                    brand: 'AKT'
                },
                expectedResponse: 'Sí, tenemos llantas para motos AKT. ¿Qué modelo específico tienes?'
            }
        ];
    }

    saveExamples() {
        localStorage.setItem('bot_conversation_examples', JSON.stringify(this.conversationExamples));
    }

    addExample(example) {
        if (!example.userInput || !example.intent) {
            return { success: false, message: 'Se requiere userInput e intent' };
        }

        this.conversationExamples.push({
            userInput: example.userInput,
            intent: example.intent,
            entities: example.entities || {},
            expectedResponse: example.expectedResponse || '',
            addedAt: new Date().toISOString()
        });

        this.saveExamples();
        return { success: true, message: 'Ejemplo agregado al entrenamiento' };
    }

    // ============================================
    // ANÁLISIS Y MÉTRICAS
    // ============================================

    getTrainingStats() {
        return {
            totalCustomResponses: Object.keys(this.customResponses).length,
            totalIntents: Object.keys(this.customIntents).length,
            totalCustomProducts: this.customProducts.length,
            totalExamples: this.conversationExamples.length,
            personality: this.botPersonality.name,
            lastUpdated: localStorage.getItem('bot_last_training_update') || 'Never'
        };
    }

    exportTrainingData() {
        const data = {
            version: '8.0',
            exportDate: new Date().toISOString(),
            responses: this.customResponses,
            intents: this.customIntents,
            products: this.customProducts,
            personality: this.botPersonality,
            examples: this.conversationExamples
        };

        return JSON.stringify(data, null, 2);
    }

    importTrainingData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (data.responses) {
                this.customResponses = data.responses;
                this.saveCustomResponses();
            }

            if (data.products) {
                this.customProducts = data.products;
                this.saveCustomProducts();
            }

            if (data.personality) {
                this.botPersonality = data.personality;
                this.savePersonality();
            }

            if (data.examples) {
                this.conversationExamples = data.examples;
                this.saveExamples();
            }

            localStorage.setItem('bot_last_training_update', new Date().toISOString());

            return { success: true, message: 'Datos importados exitosamente' };
        } catch (error) {
            return { success: false, message: 'Error al importar: ' + error.message };
        }
    }

    resetTraining() {
        localStorage.removeItem('bot_custom_responses');
        localStorage.removeItem('bot_custom_intents');
        localStorage.removeItem('bot_custom_products');
        localStorage.removeItem('bot_personality');
        localStorage.removeItem('bot_conversation_examples');

        this.customResponses = this.loadCustomResponses();
        this.customIntents = this.loadCustomIntents();
        this.customProducts = this.loadCustomProducts();
        this.botPersonality = this.loadPersonality();
        this.conversationExamples = this.loadExamples();

        return { success: true, message: 'Entrenamiento reiniciado a valores por defecto' };
    }

    // ============================================
    // INTERFAZ DE ENTRENAMIENTO
    // ============================================

    getTrainingInterface() {
        return {
            addResponse: (intent, pattern, response) => this.addCustomResponse(intent, pattern, response),
            addProduct: (productData) => this.addCustomProduct(productData),
            addExample: (example) => this.addExample(example),
            updatePersonality: (settings) => this.updatePersonality(settings),
            getStats: () => this.getTrainingStats(),
            exportData: () => this.exportTrainingData(),
            importData: (data) => this.importTrainingData(data),
            reset: () => this.resetTraining(),
            matchIntent: (input) => this.matchIntent(input),
            getResponse: (intent) => this.getResponse(intent)
        };
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.TrainingSystem = TrainingSystem;
}
