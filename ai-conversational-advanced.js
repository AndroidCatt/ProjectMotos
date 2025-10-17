/**
 * Sistema de IA Conversacional Avanzado v14.0
 * Motor de procesamiento de lenguaje natural mejorado
 *
 * Características:
 * - NLP avanzado con análisis de sentimientos
 * - Context awareness (memoria de conversación)
 * - Intent detection mejorado
 * - Entity extraction
 * - Multi-turn conversations
 * - Personalización por usuario
 */

class AIConversationalAdvanced {
    constructor() {
        this.conversationHistory = [];
        this.userContext = {};
        this.intents = this.loadIntents();
        this.entities = {};
        this.sentimentScores = [];
        this.init();
    }

    init() {
        console.log('AI Conversational Advanced v14.0 inicializado');
    }

    loadIntents() {
        return {
            greeting: {
                patterns: ['hola', 'hi', 'buenos días', 'buenas tardes', 'hey', 'qué tal'],
                responses: [
                    '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
                    '¡Bienvenido! Estoy aquí para ayudarte con repuestos de motos.',
                    '¡Hola! ¿Buscas algún repuesto específico?'
                ],
                followUp: ['¿Qué marca de moto tienes?', '¿Qué repuesto necesitas?']
            },
            productSearch: {
                patterns: ['busco', 'necesito', 'quiero', 'quisiera', 'me interesa', 'precio de'],
                entities: ['product', 'brand', 'model'],
                responses: [
                    'Déjame ayudarte a encontrar {product}. ¿Para qué marca de moto?',
                    'Tenemos varios {product}. ¿Cuál es tu presupuesto aproximado?'
                ]
            },
            priceInquiry: {
                patterns: ['cuánto cuesta', 'precio', 'cuánto vale', 'valor de', 'cotización'],
                responses: [
                    'El precio de {product} es ${price}. ¿Te gustaría agregarlo al carrito?',
                    'Para {product}, el precio es ${price}. Tenemos descuento del 10% esta semana.'
                ]
            },
            shippingInfo: {
                patterns: ['envío', 'entrega', 'despacho', 'cuánto demora', 'shipping'],
                responses: [
                    'El envío nacional tarda entre 2-5 días hábiles. ¿A qué ciudad lo necesitas?',
                    'Ofrecemos envío gratis en compras mayores a $100.000. ¿Dónde estás ubicado?'
                ]
            },
            paymentInfo: {
                patterns: ['pago', 'forma de pago', 'cómo pagar', 'métodos de pago', 'payment'],
                responses: [
                    'Aceptamos PSE, Nequi, Daviplata, tarjetas de crédito y débito.',
                    'Puedes pagar con cualquier método colombiano: PSE, billeteras digitales, tarjetas.'
                ]
            },
            complaint: {
                patterns: ['problema', 'queja', 'reclamo', 'no funciona', 'defectuoso', 'error'],
                sentiment: 'negative',
                responses: [
                    'Lamento mucho los inconvenientes. ¿Podrías describirme el problema en detalle?',
                    'Entiendo tu frustración. Déjame ayudarte a resolver esto de inmediato.'
                ],
                escalate: true
            },
            thankYou: {
                patterns: ['gracias', 'thanks', 'te agradezco', 'muchas gracias'],
                responses: [
                    '¡De nada! Es un placer ayudarte. 😊',
                    '¡Con gusto! ¿Hay algo más en lo que pueda ayudarte?'
                ]
            },
            goodbye: {
                patterns: ['adiós', 'chao', 'hasta luego', 'bye', 'nos vemos'],
                responses: [
                    '¡Hasta luego! Vuelve pronto. 👋',
                    '¡Que tengas un excelente día! Estamos aquí cuando nos necesites.'
                ]
            }
        };
    }

    // ====================================
    // PROCESAMIENTO PRINCIPAL
    // ====================================

    async processMessage(userMessage, userId = 'anonymous') {
        // 1. Guardar en historial
        this.conversationHistory.push({
            role: 'user',
            message: userMessage,
            timestamp: Date.now()
        });

        // 2. Análisis de sentimiento
        const sentiment = this.analyzeSentiment(userMessage);
        this.sentimentScores.push(sentiment);

        // 3. Detección de intent
        const intent = this.detectIntent(userMessage);

        // 4. Extracción de entidades
        const entities = this.extractEntities(userMessage, intent);

        // 5. Obtener contexto del usuario
        const context = this.getUserContext(userId);

        // 6. Generar respuesta
        const response = await this.generateResponse(intent, entities, context, sentiment);

        // 7. Guardar respuesta en historial
        this.conversationHistory.push({
            role: 'assistant',
            message: response.text,
            timestamp: Date.now()
        });

        // 8. Actualizar contexto
        this.updateUserContext(userId, intent, entities);

        return response;
    }

    // ====================================
    // ANÁLISIS DE SENTIMIENTO
    // ====================================

    analyzeSentiment(text) {
        // Validar que text existe y es string
        if (!text || typeof text !== 'string') {
            console.warn('analyzeSentiment: text is undefined or not a string');
            return { label: 'neutral', score: 0 };
        }

        const positive = ['excelente', 'perfecto', 'bueno', 'genial', 'increíble', 'maravilloso', 'gracias', 'bien'];
        const negative = ['malo', 'terrible', 'pésimo', 'problema', 'queja', 'error', 'no sirve', 'defectuoso'];
        const neutral = ['ok', 'normal', 'regular'];

        const lowerText = text.toLowerCase();

        let score = 0;

        positive.forEach(word => {
            if (lowerText.includes(word)) score += 1;
        });

        negative.forEach(word => {
            if (lowerText.includes(word)) score -= 1;
        });

        if (score > 0) return { label: 'positive', score };
        if (score < 0) return { label: 'negative', score };
        return { label: 'neutral', score: 0 };
    }

    // ====================================
    // DETECCIÓN DE INTENT
    // ====================================

    detectIntent(text) {
        const lowerText = text.toLowerCase();

        let bestMatch = null;
        let bestScore = 0;

        for (const [intentName, intentData] of Object.entries(this.intents)) {
            let score = 0;

            intentData.patterns.forEach(pattern => {
                if (lowerText.includes(pattern.toLowerCase())) {
                    score += 1;
                }
            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = intentName;
            }
        }

        return bestMatch || 'unknown';
    }

    // ====================================
    // EXTRACCIÓN DE ENTIDADES
    // ====================================

    extractEntities(text, intent) {
        const entities = {};

        // Marcas de motos
        const brands = ['yamaha', 'honda', 'suzuki', 'kawasaki', 'pulsar', 'auteco', 'tvs', 'akt'];
        brands.forEach(brand => {
            if (text.toLowerCase().includes(brand)) {
                entities.brand = brand;
            }
        });

        // Productos
        const products = [
            'llanta', 'batería', 'aceite', 'cadena', 'freno', 'filtro',
            'bujía', 'clutch', 'kit de arrastre', 'empaque', 'pistón',
            'retén', 'repuesto', 'pieza', 'kit', 'amortiguador'
        ];

        products.forEach(product => {
            if (text.toLowerCase().includes(product)) {
                entities.product = product;
            }
        });

        // Números (precios, cantidades)
        const numberMatch = text.match(/\d+/g);
        if (numberMatch) {
            entities.numbers = numberMatch.map(n => parseInt(n));
        }

        // Ciudades (para envío)
        const cities = ['bogotá', 'medellín', 'cali', 'barranquilla', 'cartagena', 'bucaramanga'];
        cities.forEach(city => {
            if (text.toLowerCase().includes(city)) {
                entities.city = city;
            }
        });

        return entities;
    }

    // ====================================
    // GENERACIÓN DE RESPUESTA
    // ====================================

    async generateResponse(intent, entities, context, sentiment) {
        // Si el sentimiento es negativo, priorizar empatía
        if (sentiment.label === 'negative') {
            return {
                text: 'Lamento mucho los inconvenientes. 😔 Déjame ayudarte a resolver esto. ¿Podrías darme más detalles?',
                intent,
                entities,
                sentiment,
                requiresEscalation: true
            };
        }

        // Respuesta basada en intent
        const intentData = this.intents[intent];

        if (!intentData) {
            return this.generateFallbackResponse(entities, context);
        }

        // Seleccionar respuesta aleatoria
        const responses = intentData.responses;
        let response = responses[Math.floor(Math.random() * responses.length)];

        // Reemplazar placeholders con entidades
        response = this.fillTemplate(response, entities, context);

        // Agregar follow-up si existe
        if (intentData.followUp && intentData.followUp.length > 0) {
            const followUp = intentData.followUp[Math.floor(Math.random() * intentData.followUp.length)];
            response += '\n\n' + followUp;
        }

        return {
            text: response,
            intent,
            entities,
            sentiment,
            requiresEscalation: intentData.escalate || false
        };
    }

    generateFallbackResponse(entities, context) {
        // Si tenemos entidades, intentar ser útil
        if (entities.product) {
            return {
                text: `Entiendo que buscas ${entities.product}. ¿Para qué marca de moto lo necesitas? Tengo información de Yamaha, Honda, Suzuki y Kawasaki.`,
                intent: 'fallback',
                entities
            };
        }

        if (entities.brand) {
            return {
                text: `Perfecto, tenemos repuestos para ${entities.brand}. ¿Qué tipo de repuesto necesitas? Puedo ayudarte con llantas, baterías, cadenas, frenos y más.`,
                intent: 'fallback',
                entities
            };
        }

        // Respuesta genérica
        return {
            text: 'No estoy seguro de entender. ¿Podrías reformular tu pregunta? Puedo ayudarte con:\n\n' +
                  '• Búsqueda de repuestos\n' +
                  '• Información de precios\n' +
                  '• Envíos y entregas\n' +
                  '• Métodos de pago\n\n' +
                  'Intenta decirme algo como: "Busco llantas para Yamaha"',
            intent: 'fallback',
            entities
        };
    }

    fillTemplate(template, entities, context) {
        let filled = template;

        // Reemplazar {product}
        if (entities.product) {
            filled = filled.replace('{product}', entities.product);
        }

        // Reemplazar {brand}
        if (entities.brand) {
            filled = filled.replace('{brand}', entities.brand);
        }

        // Reemplazar {price}
        if (entities.numbers && entities.numbers.length > 0) {
            filled = filled.replace('{price}', entities.numbers[0]);
        }

        // Usar contexto anterior
        if (context.lastProduct) {
            filled = filled.replace('{product}', context.lastProduct);
        }

        return filled;
    }

    // ====================================
    // GESTIÓN DE CONTEXTO
    // ====================================

    getUserContext(userId) {
        if (!this.userContext[userId]) {
            this.userContext[userId] = {
                preferences: {},
                history: [],
                lastIntent: null,
                lastEntities: {}
            };
        }

        return this.userContext[userId];
    }

    updateUserContext(userId, intent, entities) {
        const context = this.getUserContext(userId);

        context.lastIntent = intent;
        context.lastEntities = entities;

        // Guardar preferencias
        if (entities.brand) {
            context.preferences.brand = entities.brand;
        }

        if (entities.product) {
            context.lastProduct = entities.product;
        }

        // Limitar historial a últimos 10 intercambios
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    }

    // ====================================
    // CONVERSACIONES MULTI-TURN
    // ====================================

    canHandleFollowUp(userMessage) {
        // Palabras que indican seguimiento
        const followUpIndicators = ['sí', 'si', 'claro', 'ok', 'dale', 'perfecto', 'eso', 'ese'];

        const lowerMessage = userMessage.toLowerCase().trim();

        return followUpIndicators.some(indicator => lowerMessage === indicator);
    }

    getLastBotQuestion() {
        // Buscar la última pregunta del bot
        for (let i = this.conversationHistory.length - 1; i >= 0; i--) {
            const entry = this.conversationHistory[i];
            if (entry.role === 'assistant' && entry.message.includes('?')) {
                return entry.message;
            }
        }
        return null;
    }

    // ====================================
    // PERSONALIZACIÓN
    // ====================================

    getPersonalizedGreeting(userId) {
        const context = this.getUserContext(userId);
        const hour = new Date().getHours();

        let timeGreeting = '¡Hola!';
        if (hour < 12) timeGreeting = '¡Buenos días!';
        else if (hour < 19) timeGreeting = '¡Buenas tardes!';
        else timeGreeting = '¡Buenas noches!';

        if (context.preferences.brand) {
            return `${timeGreeting} Veo que tienes una moto ${context.preferences.brand}. ¿En qué puedo ayudarte hoy?`;
        }

        return `${timeGreeting} ¿En qué puedo ayudarte hoy?`;
    }

    // ====================================
    // ANALYTICS Y MÉTRICAS
    // ====================================

    getConversationMetrics() {
        const totalMessages = this.conversationHistory.length;
        const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
        const botMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;

        const avgSentiment = this.sentimentScores.reduce((acc, s) => acc + s.score, 0) / this.sentimentScores.length || 0;

        return {
            totalMessages,
            userMessages,
            botMessages,
            avgSentiment: avgSentiment.toFixed(2),
            duration: this.getConversationDuration()
        };
    }

    getConversationDuration() {
        if (this.conversationHistory.length < 2) return 0;

        const first = this.conversationHistory[0].timestamp;
        const last = this.conversationHistory[this.conversationHistory.length - 1].timestamp;

        return Math.floor((last - first) / 1000); // segundos
    }

    // ====================================
    // EXPORTAR CONVERSACIÓN
    // ====================================

    exportConversation() {
        const metrics = this.getConversationMetrics();

        const data = {
            conversation: this.conversationHistory,
            metrics,
            sentimentScores: this.sentimentScores,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    // ====================================
    // ENTRENAMIENTO AVANZADO
    // ====================================

    addCustomIntent(intentName, patterns, responses) {
        this.intents[intentName] = {
            patterns,
            responses
        };

        console.log(`Intent personalizado agregado: ${intentName}`);
    }

    removeIntent(intentName) {
        delete this.intents[intentName];
    }

    updateIntent(intentName, newData) {
        if (this.intents[intentName]) {
            this.intents[intentName] = {
                ...this.intents[intentName],
                ...newData
            };
        }
    }

    // ====================================
    // SUGERENCIAS INTELIGENTES
    // ====================================

    getSuggestions(context) {
        const suggestions = [];

        // Basado en contexto previo
        if (context.lastProduct) {
            suggestions.push(`Ver más ${context.lastProduct}`);
            suggestions.push('Comparar precios');
        }

        if (context.preferences.brand) {
            suggestions.push(`Otros repuestos para ${context.preferences.brand}`);
        }

        // Sugerencias generales
        suggestions.push('Ver catálogo completo');
        suggestions.push('Información de envío');
        suggestions.push('Métodos de pago');

        return suggestions.slice(0, 3); // Máximo 3 sugerencias
    }

    // ====================================
    // LIMPIEZA Y RESET
    // ====================================

    clearHistory() {
        this.conversationHistory = [];
        this.sentimentScores = [];
    }

    resetUserContext(userId) {
        delete this.userContext[userId];
    }

    resetAll() {
        this.conversationHistory = [];
        this.userContext = {};
        this.sentimentScores = [];
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.aiConversational = new AIConversationalAdvanced();
}
