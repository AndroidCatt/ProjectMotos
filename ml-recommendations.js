// ML Recommendations System - Sistema de Recomendaciones con Machine Learning v9.0
// Utiliza collaborative filtering, content-based filtering y algoritmos híbridos

class MLRecommendationEngine {
    constructor() {
        this.userPreferences = this.loadUserPreferences();
        this.productVectors = this.loadProductVectors();
        this.userSimilarities = {};
        this.productSimilarities = {};
        this.viewHistory = this.loadViewHistory();
        this.purchaseHistory = this.loadPurchaseHistory();
        this.ratingsMatrix = this.loadRatingsMatrix();
    }

    // ============================================
    // CARGAR/GUARDAR DATOS
    // ============================================

    loadUserPreferences() {
        const saved = localStorage.getItem('ml_user_preferences');
        return saved ? JSON.parse(saved) : {};
    }

    saveUserPreferences() {
        localStorage.setItem('ml_user_preferences', JSON.stringify(this.userPreferences));
    }

    loadProductVectors() {
        const saved = localStorage.getItem('ml_product_vectors');
        return saved ? JSON.parse(saved) : {};
    }

    saveProductVectors() {
        localStorage.setItem('ml_product_vectors', JSON.stringify(this.productVectors));
    }

    loadViewHistory() {
        const saved = localStorage.getItem('ml_view_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveViewHistory() {
        localStorage.setItem('ml_view_history', JSON.stringify(this.viewHistory));
    }

    loadPurchaseHistory() {
        const saved = localStorage.getItem('ml_purchase_history');
        return saved ? JSON.parse(saved) : [];
    }

    savePurchaseHistory() {
        localStorage.setItem('ml_purchase_history', JSON.stringify(this.purchaseHistory));
    }

    loadRatingsMatrix() {
        const saved = localStorage.getItem('ml_ratings_matrix');
        return saved ? JSON.parse(saved) : {};
    }

    saveRatingsMatrix() {
        localStorage.setItem('ml_ratings_matrix', JSON.stringify(this.ratingsMatrix));
    }

    // ============================================
    // VECTORIZACIÓN DE PRODUCTOS (Feature Extraction)
    // ============================================

    vectorizeProduct(product) {
        // Crear vector de características del producto
        const vector = {
            // Características categóricas (one-hot encoding)
            category: this.oneHotEncode(product.category, ['motor', 'frenos', 'suspension', 'electrico', 'carroceria']),
            brand: this.oneHotEncode(product.brand, ['Auteco', 'AKT', 'TVS', 'Boxer']),

            // Características numéricas (normalizadas)
            priceRange: this.normalizePrice(product.price),
            discount: product.discount / 100,
            rating: product.rating / 5,
            popularity: this.calculatePopularity(product.id),

            // Características derivadas
            isPremium: product.price > 200000 ? 1 : 0,
            hasDiscount: product.discount > 0 ? 1 : 0,
            isHighRated: product.rating >= 4.0 ? 1 : 0
        };

        // Guardar vector
        this.productVectors[product.id] = vector;
        this.saveProductVectors();

        return vector;
    }

    oneHotEncode(value, categories) {
        const encoded = {};
        categories.forEach(cat => {
            encoded[cat] = value === cat ? 1 : 0;
        });
        return encoded;
    }

    normalizePrice(price) {
        // Normalizar precio entre 0 y 1 (asumiendo rango 0-500,000)
        const maxPrice = 500000;
        return Math.min(price / maxPrice, 1);
    }

    calculatePopularity(productId) {
        // Calcular popularidad basado en vistas y compras
        const views = this.viewHistory.filter(v => v.productId === productId).length;
        const purchases = this.purchaseHistory.filter(p => p.productId === productId).length;

        // Fórmula: (views * 0.3 + purchases * 0.7) normalizado
        const score = (views * 0.3 + purchases * 0.7) / 100;
        return Math.min(score, 1);
    }

    // ============================================
    // SIMILITUD DE PRODUCTOS (Content-Based)
    // ============================================

    cosineSimilarity(vectorA, vectorB) {
        // Calcular similitud coseno entre dos vectores
        const flatA = this.flattenVector(vectorA);
        const flatB = this.flattenVector(vectorB);

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        const keys = new Set([...Object.keys(flatA), ...Object.keys(flatB)]);

        keys.forEach(key => {
            const a = flatA[key] || 0;
            const b = flatB[key] || 0;

            dotProduct += a * b;
            normA += a * a;
            normB += b * b;
        });

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    flattenVector(vector) {
        const flat = {};

        Object.keys(vector).forEach(key => {
            if (typeof vector[key] === 'object') {
                Object.keys(vector[key]).forEach(subKey => {
                    flat[`${key}_${subKey}`] = vector[key][subKey];
                });
            } else {
                flat[key] = vector[key];
            }
        });

        return flat;
    }

    findSimilarProducts(productId, topN = 5) {
        const targetVector = this.productVectors[productId];

        if (!targetVector) {
            console.warn('Producto no vectorizado:', productId);
            return [];
        }

        const similarities = [];

        Object.keys(this.productVectors).forEach(otherId => {
            if (otherId !== productId) {
                const similarity = this.cosineSimilarity(targetVector, this.productVectors[otherId]);
                similarities.push({
                    productId: otherId,
                    similarity
                });
            }
        });

        // Ordenar por similitud descendente
        similarities.sort((a, b) => b.similarity - a.similarity);

        return similarities.slice(0, topN);
    }

    // ============================================
    // COLLABORATIVE FILTERING (Filtrado Colaborativo)
    // ============================================

    recordRating(userId, productId, rating) {
        if (!this.ratingsMatrix[userId]) {
            this.ratingsMatrix[userId] = {};
        }

        this.ratingsMatrix[userId][productId] = rating;
        this.saveRatingsMatrix();
    }

    userSimilarity(userA, userB) {
        // Calcular similitud entre usuarios basado en ratings comunes
        const ratingsA = this.ratingsMatrix[userA] || {};
        const ratingsB = this.ratingsMatrix[userB] || {};

        const commonProducts = Object.keys(ratingsA).filter(p => ratingsB[p] !== undefined);

        if (commonProducts.length === 0) return 0;

        // Correlación de Pearson
        const meanA = commonProducts.reduce((sum, p) => sum + ratingsA[p], 0) / commonProducts.length;
        const meanB = commonProducts.reduce((sum, p) => sum + ratingsB[p], 0) / commonProducts.length;

        let numerator = 0;
        let denomA = 0;
        let denomB = 0;

        commonProducts.forEach(p => {
            const diffA = ratingsA[p] - meanA;
            const diffB = ratingsB[p] - meanB;

            numerator += diffA * diffB;
            denomA += diffA * diffA;
            denomB += diffB * diffB;
        });

        if (denomA === 0 || denomB === 0) return 0;

        return numerator / (Math.sqrt(denomA) * Math.sqrt(denomB));
    }

    collaborativeRecommendations(userId, topN = 5) {
        // Encontrar usuarios similares
        const similarities = [];

        Object.keys(this.ratingsMatrix).forEach(otherId => {
            if (otherId !== userId) {
                const sim = this.userSimilarity(userId, otherId);
                if (sim > 0) {
                    similarities.push({ userId: otherId, similarity: sim });
                }
            }
        });

        // Ordenar por similitud
        similarities.sort((a, b) => b.similarity - a.similarity);

        // Tomar top 10 usuarios similares
        const topUsers = similarities.slice(0, 10);

        if (topUsers.length === 0) return [];

        // Predecir ratings para productos no vistos
        const userRatings = this.ratingsMatrix[userId] || {};
        const predictions = {};

        topUsers.forEach(({ userId: otherId, similarity }) => {
            const otherRatings = this.ratingsMatrix[otherId] || {};

            Object.keys(otherRatings).forEach(productId => {
                // Si el usuario no ha calificado este producto
                if (!userRatings[productId]) {
                    if (!predictions[productId]) {
                        predictions[productId] = { sum: 0, weightSum: 0 };
                    }

                    predictions[productId].sum += otherRatings[productId] * similarity;
                    predictions[productId].weightSum += similarity;
                }
            });
        });

        // Calcular rating predicho
        const recommendations = [];

        Object.keys(predictions).forEach(productId => {
            const { sum, weightSum } = predictions[productId];
            const predictedRating = sum / weightSum;

            recommendations.push({
                productId,
                predictedRating
            });
        });

        // Ordenar por rating predicho
        recommendations.sort((a, b) => b.predictedRating - a.predictedRating);

        return recommendations.slice(0, topN);
    }

    // ============================================
    // HYBRID RECOMMENDATIONS (Híbrido)
    // ============================================

    hybridRecommendations(userId, productId = null, topN = 10) {
        let contentBased = [];
        let collaborative = [];

        // Si hay producto, usar content-based
        if (productId) {
            contentBased = this.findSimilarProducts(productId, topN);
        } else {
            // Usar últimos productos vistos
            const recentViews = this.viewHistory
                .filter(v => v.userId === userId)
                .slice(-3);

            recentViews.forEach(view => {
                const similar = this.findSimilarProducts(view.productId, 3);
                contentBased.push(...similar);
            });
        }

        // Collaborative filtering
        collaborative = this.collaborativeRecommendations(userId, topN);

        // Combinar resultados (weighted average)
        const combined = {};

        // Content-based: peso 0.6
        contentBased.forEach(({ productId, similarity }) => {
            combined[productId] = (combined[productId] || 0) + similarity * 0.6;
        });

        // Collaborative: peso 0.4
        collaborative.forEach(({ productId, predictedRating }) => {
            combined[productId] = (combined[productId] || 0) + (predictedRating / 5) * 0.4;
        });

        // Agregar popularidad como boost
        Object.keys(combined).forEach(productId => {
            const vector = this.productVectors[productId];
            if (vector) {
                combined[productId] += vector.popularity * 0.2;
            }
        });

        // Convertir a array y ordenar
        const recommendations = Object.keys(combined).map(productId => ({
            productId,
            score: combined[productId]
        }));

        recommendations.sort((a, b) => b.score - a.score);

        return recommendations.slice(0, topN);
    }

    // ============================================
    // TRACKING DE COMPORTAMIENTO
    // ============================================

    trackProductView(userId, productId, product) {
        // Registrar vista
        this.viewHistory.push({
            userId,
            productId,
            timestamp: new Date().toISOString()
        });

        // Mantener solo últimas 100 vistas
        if (this.viewHistory.length > 100) {
            this.viewHistory.shift();
        }

        this.saveViewHistory();

        // Vectorizar producto si no existe
        if (!this.productVectors[productId]) {
            this.vectorizeProduct(product);
        }

        // Actualizar preferencias del usuario
        this.updateUserPreferences(userId, product);
    }

    trackPurchase(userId, productId, product) {
        // Registrar compra
        this.purchaseHistory.push({
            userId,
            productId,
            timestamp: new Date().toISOString()
        });

        this.savePurchaseHistory();

        // Actualizar preferencias con mayor peso
        this.updateUserPreferences(userId, product, 3.0);

        // Auto-rating implícito (compra = rating alto)
        this.recordRating(userId, productId, 4.5);
    }

    updateUserPreferences(userId, product, weight = 1.0) {
        if (!this.userPreferences[userId]) {
            this.userPreferences[userId] = {
                categories: {},
                brands: {},
                priceRange: { min: Infinity, max: 0 },
                avgRating: 0,
                totalProducts: 0
            };
        }

        const prefs = this.userPreferences[userId];

        // Actualizar preferencia de categoría
        prefs.categories[product.category] = (prefs.categories[product.category] || 0) + weight;

        // Actualizar preferencia de marca
        prefs.brands[product.brand] = (prefs.brands[product.brand] || 0) + weight;

        // Actualizar rango de precio
        prefs.priceRange.min = Math.min(prefs.priceRange.min, product.price);
        prefs.priceRange.max = Math.max(prefs.priceRange.max, product.price);

        // Actualizar rating promedio
        prefs.avgRating = ((prefs.avgRating * prefs.totalProducts) + product.rating) / (prefs.totalProducts + 1);
        prefs.totalProducts++;

        this.saveUserPreferences();
    }

    // ============================================
    // RECOMENDACIONES PERSONALIZADAS
    // ============================================

    getPersonalizedRecommendations(userId, context = {}) {
        const prefs = this.userPreferences[userId];

        if (!prefs) {
            // Usuario nuevo: recomendar productos populares
            return this.getPopularProducts(10);
        }

        // Obtener recomendaciones híbridas
        const recommendations = this.hybridRecommendations(userId, context.productId, 20);

        // Aplicar filtros de contexto
        let filtered = recommendations;

        if (context.category) {
            filtered = filtered.filter(r => {
                const vector = this.productVectors[r.productId];
                return vector && vector.category[context.category] === 1;
            });
        }

        if (context.maxPrice) {
            filtered = filtered.filter(r => {
                const vector = this.productVectors[r.productId];
                return vector && vector.priceRange * 500000 <= context.maxPrice;
            });
        }

        // Diversificar recomendaciones (evitar que todas sean de la misma categoría)
        const diversified = this.diversifyRecommendations(filtered, 10);

        return diversified;
    }

    diversifyRecommendations(recommendations, topN) {
        const selected = [];
        const categoryCounts = {};

        for (const rec of recommendations) {
            const vector = this.productVectors[rec.productId];
            if (!vector) continue;

            // Encontrar categoría principal
            const category = Object.keys(vector.category).find(c => vector.category[c] === 1);

            // Limitar a máximo 4 productos por categoría
            if (!categoryCounts[category] || categoryCounts[category] < 4) {
                selected.push(rec);
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;

                if (selected.length >= topN) break;
            }
        }

        return selected;
    }

    getPopularProducts(topN = 10) {
        // Productos más populares (basado en vistas y compras)
        const popularity = {};

        this.viewHistory.forEach(v => {
            popularity[v.productId] = (popularity[v.productId] || 0) + 1;
        });

        this.purchaseHistory.forEach(p => {
            popularity[p.productId] = (popularity[p.productId] || 0) + 5; // Peso mayor para compras
        });

        const sorted = Object.keys(popularity)
            .map(productId => ({ productId, score: popularity[productId] }))
            .sort((a, b) => b.score - a.score);

        return sorted.slice(0, topN);
    }

    // ============================================
    // ANÁLISIS Y MÉTRICAS
    // ============================================

    getRecommendationAccuracy() {
        // Calcular precisión de recomendaciones basado en compras reales
        let correct = 0;
        let total = 0;

        // Para cada usuario que haya comprado
        const users = new Set(this.purchaseHistory.map(p => p.userId));

        users.forEach(userId => {
            const purchases = this.purchaseHistory.filter(p => p.userId === userId);
            const recommendations = this.hybridRecommendations(userId, null, 10);

            purchases.forEach(purchase => {
                total++;
                if (recommendations.some(r => r.productId === purchase.productId)) {
                    correct++;
                }
            });
        });

        return total > 0 ? (correct / total) * 100 : 0;
    }

    exportModel() {
        return {
            productVectors: this.productVectors,
            userPreferences: this.userPreferences,
            ratingsMatrix: this.ratingsMatrix,
            viewHistory: this.viewHistory.slice(-100),
            purchaseHistory: this.purchaseHistory.slice(-100)
        };
    }

    importModel(modelData) {
        this.productVectors = modelData.productVectors || {};
        this.userPreferences = modelData.userPreferences || {};
        this.ratingsMatrix = modelData.ratingsMatrix || {};
        this.viewHistory = modelData.viewHistory || [];
        this.purchaseHistory = modelData.purchaseHistory || [];

        this.saveProductVectors();
        this.saveUserPreferences();
        this.saveRatingsMatrix();
        this.saveViewHistory();
        this.savePurchaseHistory();
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.MLRecommendationEngine = MLRecommendationEngine;
}
