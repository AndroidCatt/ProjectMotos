// AI Chatbot Advanced - Chatbot con NLP y Machine Learning v11.0
// Natural Language Processing, Intent Recognition, Context Management

class AIAdvancedChatbot {
    constructor() {
        this.intents = this.defineIntents();
        this.context = {};
        this.conversationHistory = [];
        this.userPreferences = this.loadPreferences();
        this.sentimentAnalyzer = new SentimentAnalyzer();
        this.entityExtractor = new EntityExtractor();
        this.responseGenerator = new ResponseGenerator();

        console.log('[AI Chatbot] Advanced AI initialized');
    }

    // ============================================
    // INTENT RECOGNITION
    // ============================================

    defineIntents() {
        return {
            greeting: {
                patterns: ['hola', 'buenos dias', 'buenas tardes', 'hey', 'hello', 'hi'],
                responses: [
                    '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
                    '¡Bienvenido! Estoy aquí para ayudarte con repuestos.',
                    '¡Hola! ¿Buscas algún repuesto en particular?'
                ],
                action: 'greeting'
            },
            search_product: {
                patterns: ['buscar', 'necesito', 'quiero', 'busco', 'dame', 'mostrar', 'ver'],
                entities: ['product_type', 'brand', 'model'],
                responses: ['Claro, déjame buscar {product_type} para ti.'],
                action: 'search'
            },
            price_inquiry: {
                patterns: ['precio', 'cuesta', 'vale', 'cuanto', 'cost'],
                entities: ['product_name'],
                responses: ['El precio de {product_name} es ${price}'],
                action: 'get_price'
            },
            availability: {
                patterns: ['hay', 'tienen', 'disponible', 'stock', 'existencia'],
                entities: ['product_name'],
                responses: ['Tenemos {quantity} unidades de {product_name} disponibles'],
                action: 'check_stock'
            },
            comparison: {
                patterns: ['comparar', 'diferencia', 'cual es mejor', 'versus', 'vs'],
                entities: ['product1', 'product2'],
                responses: ['Te muestro la comparación entre {product1} y {product2}'],
                action: 'compare'
            },
            recommendation: {
                patterns: ['recomendar', 'sugerir', 'aconsejar', 'que me recomiendas'],
                entities: ['category', 'budget'],
                responses: ['Basado en tus preferencias, te recomiendo:'],
                action: 'recommend'
            },
            order_status: {
                patterns: ['pedido', 'orden', 'compra', 'tracking', 'seguimiento'],
                entities: ['order_id'],
                responses: ['Tu pedido #{order_id} está en estado: {status}'],
                action: 'track_order'
            },
            complaint: {
                patterns: ['problema', 'queja', 'reclamo', 'no funciona', 'mal', 'defectuoso'],
                entities: ['issue_type'],
                responses: ['Lamento escuchar eso. Voy a ayudarte con {issue_type}'],
                action: 'handle_complaint'
            },
            thanks: {
                patterns: ['gracias', 'thank', 'excelente', 'perfecto', 'genial'],
                responses: ['¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?'],
                action: 'acknowledge'
            },
            goodbye: {
                patterns: ['adios', 'chao', 'hasta luego', 'bye', 'nos vemos'],
                responses: ['¡Hasta pronto! Que tengas un excelente día. 👋'],
                action: 'goodbye'
            }
        };
    }

    async processMessage(message) {
        const userMessage = message.toLowerCase().trim();

        // 1. Guardar en historial
        this.conversationHistory.push({
            role: 'user',
            message: userMessage,
            timestamp: Date.now()
        });

        // 2. Análisis de sentimiento
        const sentiment = this.sentimentAnalyzer.analyze(userMessage);

        // 3. Reconocer intent
        const intent = this.recognizeIntent(userMessage);

        // 4. Extraer entidades
        const entities = this.entityExtractor.extract(userMessage, intent);

        // 5. Actualizar contexto
        this.updateContext(intent, entities, sentiment);

        // 6. Generar respuesta
        const response = await this.generateResponse(intent, entities, sentiment);

        // 7. Guardar respuesta en historial
        this.conversationHistory.push({
            role: 'assistant',
            message: response.text,
            timestamp: Date.now()
        });

        // 8. Ejecutar acción si existe
        if (response.action) {
            await this.executeAction(response.action, entities);
        }

        return response;
    }

    recognizeIntent(message) {
        let bestMatch = {
            intent: 'unknown',
            confidence: 0
        };

        for (const [intentName, intentData] of Object.entries(this.intents)) {
            const confidence = this.calculateIntentConfidence(message, intentData.patterns);

            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    intent: intentName,
                    confidence: confidence,
                    data: intentData
                };
            }
        }

        console.log('[AI] Intent recognized:', bestMatch.intent, 'Confidence:', bestMatch.confidence);

        return bestMatch;
    }

    calculateIntentConfidence(message, patterns) {
        let maxConfidence = 0;

        patterns.forEach(pattern => {
            const words = message.split(' ');
            const patternWords = pattern.split(' ');

            let matches = 0;
            patternWords.forEach(patternWord => {
                if (words.some(word => word.includes(patternWord) || patternWord.includes(word))) {
                    matches++;
                }
            });

            const confidence = matches / patternWords.length;
            maxConfidence = Math.max(maxConfidence, confidence);
        });

        return maxConfidence;
    }

    async generateResponse(intent, entities, sentiment) {
        // Si el sentimiento es muy negativo, ajustar la respuesta
        if (sentiment.score < -0.5) {
            return {
                text: 'Noto que estás frustrado. Permíteme ayudarte de inmediato. ¿Puedes contarme más sobre el problema?',
                action: 'escalate_support',
                sentiment: 'negative'
            };
        }

        // Generar respuesta según el intent
        if (intent.intent === 'unknown') {
            return {
                text: 'No estoy seguro de entender. ¿Podrías reformular tu pregunta? Puedo ayudarte con búsqueda de productos, precios, disponibilidad y más.',
                action: null
            };
        }

        const intentData = intent.data;
        let responseText = this.selectResponse(intentData.responses);

        // Reemplazar variables con entidades
        if (entities) {
            Object.keys(entities).forEach(key => {
                responseText = responseText.replace(`{${key}}`, entities[key]);
            });
        }

        return {
            text: responseText,
            action: intentData.action,
            intent: intent.intent,
            confidence: intent.confidence,
            entities: entities
        };
    }

    selectResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    updateContext(intent, entities, sentiment) {
        this.context.lastIntent = intent.intent;
        this.context.lastEntities = entities;
        this.context.lastSentiment = sentiment;
        this.context.timestamp = Date.now();

        // Mantener contexto de conversación
        if (intent.intent === 'search_product') {
            this.context.searchingProduct = entities.product_type;
        }

        if (intent.intent === 'comparison') {
            this.context.comparing = [entities.product1, entities.product2];
        }
    }

    async executeAction(action, entities) {
        console.log('[AI] Executing action:', action, entities);

        switch (action) {
            case 'search':
                if (entities.product_type) {
                    return await this.searchProducts(entities.product_type);
                }
                break;

            case 'get_price':
                if (entities.product_name) {
                    return await this.getProductPrice(entities.product_name);
                }
                break;

            case 'check_stock':
                if (entities.product_name) {
                    return await this.checkAvailability(entities.product_name);
                }
                break;

            case 'recommend':
                return await this.getRecommendations(entities);

            case 'track_order':
                if (entities.order_id) {
                    return await this.trackOrder(entities.order_id);
                }
                break;

            case 'handle_complaint':
                return await this.createSupportTicket(entities);
        }
    }

    // ============================================
    // ACTIONS
    // ============================================

    async searchProducts(query) {
        if (window.elasticsearch) {
            return window.elasticsearch.search('products', {
                query: { multi_match: { query, fields: ['name', 'description', 'category'] } }
            });
        }
        return [];
    }

    async getProductPrice(productName) {
        const results = await this.searchProducts(productName);
        if (results.hits && results.hits.hits.length > 0) {
            return results.hits.hits[0]._source.price;
        }
        return null;
    }

    async checkAvailability(productName) {
        const results = await this.searchProducts(productName);
        if (results.hits && results.hits.hits.length > 0) {
            return results.hits.hits[0]._source.stock;
        }
        return 0;
    }

    async getRecommendations(entities) {
        if (window.mlEngine) {
            const userId = window.authSystem?.getCurrentUser()?.id || 'guest';
            return window.mlEngine.getPersonalizedRecommendations(userId, entities);
        }
        return [];
    }

    async trackOrder(orderId) {
        if (window.graphqlAPI) {
            return window.graphqlAPI.resolvers.Query.order(null, { id: orderId });
        }
        return null;
    }

    async createSupportTicket(entities) {
        const ticket = {
            id: 'ticket_' + Date.now(),
            userId: window.authSystem?.getCurrentUser()?.id,
            issue: entities.issue_type || 'General',
            description: entities.description || '',
            status: 'open',
            priority: 'medium',
            createdAt: new Date().toISOString()
        };

        // Guardar en localStorage
        const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
        tickets.push(ticket);
        localStorage.setItem('support_tickets', JSON.stringify(tickets));

        return ticket;
    }

    // ============================================
    // CONVERSATION MANAGEMENT
    // ============================================

    getConversationHistory(limit = 10) {
        return this.conversationHistory.slice(-limit);
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    exportConversation(format = 'text') {
        if (format === 'json') {
            return JSON.stringify(this.conversationHistory, null, 2);
        }

        let text = 'Conversación exportada\\n';
        text += `Fecha: ${new Date().toLocaleString()}\\n\\n`;

        this.conversationHistory.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            text += `[${time}] ${msg.role}: ${msg.message}\\n`;
        });

        return text;
    }

    // ============================================
    // USER PREFERENCES
    // ============================================

    loadPreferences() {
        const saved = localStorage.getItem('ai_user_preferences');
        return saved ? JSON.parse(saved) : {
            language: 'es',
            responseStyle: 'friendly',
            interests: [],
            frequentSearches: []
        };
    }

    savePreferences() {
        localStorage.setItem('ai_user_preferences', JSON.stringify(this.userPreferences));
    }

    updatePreferences(preferences) {
        this.userPreferences = { ...this.userPreferences, ...preferences };
        this.savePreferences();
    }
}

// ============================================
// SENTIMENT ANALYZER
// ============================================

class SentimentAnalyzer {
    constructor() {
        this.positiveWords = [
            'excelente', 'genial', 'perfecto', 'bueno', 'bien', 'gracias',
            'me gusta', 'increíble', 'fantástico', 'maravilloso', 'feliz'
        ];

        this.negativeWords = [
            'malo', 'terrible', 'horrible', 'problema', 'error', 'defectuoso',
            'no funciona', 'roto', 'queja', 'frustrado', 'molesto', 'enojado'
        ];
    }

    analyze(text) {
        const words = text.toLowerCase().split(' ');
        let score = 0;

        words.forEach(word => {
            if (this.positiveWords.some(pw => word.includes(pw))) {
                score += 1;
            }
            if (this.negativeWords.some(nw => word.includes(nw))) {
                score -= 1;
            }
        });

        // Normalizar score entre -1 y 1
        const normalizedScore = Math.max(-1, Math.min(1, score / words.length * 10));

        return {
            score: normalizedScore,
            label: normalizedScore > 0.2 ? 'positive' : normalizedScore < -0.2 ? 'negative' : 'neutral'
        };
    }
}

// ============================================
// ENTITY EXTRACTOR
// ============================================

class EntityExtractor {
    constructor() {
        this.productTypes = [
            'filtro', 'aceite', 'llanta', 'bateria', 'freno', 'cadena',
            'bujia', 'amortiguador', 'escape', 'clutch', 'embrague'
        ];

        this.brands = ['honda', 'yamaha', 'suzuki', 'kawasaki', 'bajaj', 'tvs'];

        this.numbers = /\d+/g;
    }

    extract(text, intent) {
        const entities = {};
        const words = text.toLowerCase().split(' ');

        // Extraer tipo de producto
        this.productTypes.forEach(type => {
            if (words.includes(type) || text.includes(type)) {
                entities.product_type = type;
            }
        });

        // Extraer marca
        this.brands.forEach(brand => {
            if (words.includes(brand)) {
                entities.brand = brand;
            }
        });

        // Extraer números (precios, cantidades, order IDs)
        const numbers = text.match(this.numbers);
        if (numbers) {
            if (intent.intent === 'order_status') {
                entities.order_id = numbers[0];
            } else if (text.includes('precio') || text.includes('$')) {
                entities.price = parseInt(numbers[0]);
            } else {
                entities.quantity = parseInt(numbers[0]);
            }
        }

        return entities;
    }
}

// ============================================
// RESPONSE GENERATOR
// ============================================

class ResponseGenerator {
    constructor() {
        this.templates = {
            product_found: 'Encontré {count} productos de {category}. Aquí están los mejores:',
            no_products: 'Lo siento, no encontré productos que coincidan con "{query}". ¿Quieres que busque algo similar?',
            price_info: 'El {product} tiene un precio de ${price}. {discount_info}',
            stock_available: 'Tenemos {quantity} unidades disponibles de {product}.',
            out_of_stock: 'Lo siento, {product} está agotado. ¿Te gustaría que te notifiquemos cuando esté disponible?'
        };
    }

    generate(template, variables) {
        let text = this.templates[template] || template;

        Object.keys(variables).forEach(key => {
            text = text.replace(`{${key}}`, variables[key]);
        });

        return text;
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.AIAdvancedChatbot = AIAdvancedChatbot;
    window.aiChatbot = new AIAdvancedChatbot();
}
