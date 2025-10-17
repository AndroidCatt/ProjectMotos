/**
 * Sistema de Búsqueda Avanzada con IA v16.0
 * Búsqueda inteligente, por imagen, voz y compatibilidad
 *
 * Características:
 * - Búsqueda por texto avanzada con NLP
 * - Búsqueda por imagen (upload o cámara)
 * - Búsqueda por voz mejorada
 * - Búsqueda por compatibilidad (moto/año/modelo)
 * - Autocompletado inteligente
 * - Filtros avanzados dinámicos
 * - Historial de búsquedas
 * - Sugerencias personalizadas
 */

class SearchAIAdvanced {
    constructor() {
        this.searchHistory = this.loadHistory();
        this.filters = {};
        this.currentResults = [];
        this.voiceRecognition = null;
        this.init();
    }

    init() {
        console.log('Search AI Advanced v16.0 inicializado');
        this.setupVoiceSearch();
        this.setupImageSearch();
        this.setupAutocomplete();
    }

    loadHistory() {
        const stored = localStorage.getItem('searchHistory');
        return stored ? JSON.parse(stored) : [];
    }

    saveHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    // ====================================
    // BÚSQUEDA AVANZADA POR TEXTO
    // ====================================

    async searchAdvanced(query, options = {}) {
        console.log('Búsqueda avanzada:', query);

        // Normalizar query
        const normalizedQuery = this.normalizeQuery(query);

        // Extraer intents y entidades
        const analyzed = this.analyzeQuery(normalizedQuery);

        // Buscar en base de datos
        let results = await this.searchInDatabase(analyzed, options);

        // Aplicar filtros
        if (Object.keys(this.filters).length > 0) {
            results = this.applyFilters(results, this.filters);
        }

        // Ordenar por relevancia
        results = this.rankResults(results, analyzed);

        // Guardar en historial
        this.addToHistory(query, results.length);

        this.currentResults = results;
        return results;
    }

    normalizeQuery(query) {
        return query.toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/\s+/g, ' '); // Normalizar espacios
    }

    analyzeQuery(query) {
        const analysis = {
            originalQuery: query,
            keywords: [],
            brand: null,
            category: null,
            priceRange: null,
            model: null,
            year: null,
            intent: 'search'
        };

        // Detectar marca
        const brands = ['yamaha', 'honda', 'suzuki', 'kawasaki', 'pulsar', 'akt', 'tvs', 'auteco'];
        brands.forEach(brand => {
            if (query.includes(brand)) {
                analysis.brand = brand;
                analysis.keywords.push(brand);
            }
        });

        // Detectar categoría
        const categories = {
            'llanta': ['llanta', 'neumatico', 'caucho', 'rueda'],
            'bateria': ['bateria', 'pila'],
            'aceite': ['aceite', 'lubricante'],
            'cadena': ['cadena', 'transmision'],
            'freno': ['freno', 'pastilla', 'disco'],
            'filtro': ['filtro'],
            'bujia': ['bujia', 'chispa']
        };

        Object.entries(categories).forEach(([cat, keywords]) => {
            keywords.forEach(kw => {
                if (query.includes(kw)) {
                    analysis.category = cat;
                    analysis.keywords.push(kw);
                }
            });
        });

        // Detectar rango de precio
        const priceMatch = query.match(/(\d+)k?\s*[-a]\s*(\d+)k?/);
        if (priceMatch) {
            analysis.priceRange = {
                min: parseInt(priceMatch[1]) * (priceMatch[1].includes('k') ? 1000 : 1),
                max: parseInt(priceMatch[2]) * (priceMatch[2].includes('k') ? 1000 : 1)
            };
        }

        // Detectar año
        const yearMatch = query.match(/20\d{2}/);
        if (yearMatch) {
            analysis.year = parseInt(yearMatch[0]);
        }

        // Extraer otras palabras clave
        const stopWords = ['de', 'para', 'con', 'en', 'la', 'el', 'un', 'una', 'los', 'las'];
        const words = query.split(' ').filter(w => w.length > 2 && !stopWords.includes(w));
        analysis.keywords.push(...words);

        // Remover duplicados
        analysis.keywords = [...new Set(analysis.keywords)];

        return analysis;
    }

    async searchInDatabase(analyzed, options) {
        // En producción, esto sería una consulta a API/BD
        // Aquí simulamos con datos del chatbot

        const allProducts = window.chatbot?.products || [];
        let results = [];

        // Buscar por keywords
        results = allProducts.filter(product => {
            const productText = `${product.name} ${product.brand} ${product.category} ${product.description || ''}`.toLowerCase();

            // Match por keywords
            const keywordMatch = analyzed.keywords.some(kw => productText.includes(kw));

            // Match por marca
            const brandMatch = !analyzed.brand || product.brand?.toLowerCase() === analyzed.brand;

            // Match por categoría
            const categoryMatch = !analyzed.category || product.category?.toLowerCase().includes(analyzed.category);

            // Match por precio
            let priceMatch = true;
            if (analyzed.priceRange) {
                const price = typeof product.price === 'string' ?
                    parseInt(product.price.replace(/\D/g, '')) : product.price;
                priceMatch = price >= analyzed.priceRange.min && price <= analyzed.priceRange.max;
            }

            return keywordMatch && brandMatch && categoryMatch && priceMatch;
        });

        return results;
    }

    rankResults(results, analyzed) {
        return results.map(product => {
            let score = 0;

            // Puntos por match exacto de marca
            if (analyzed.brand && product.brand?.toLowerCase() === analyzed.brand) {
                score += 10;
            }

            // Puntos por match de categoría
            if (analyzed.category && product.category?.toLowerCase().includes(analyzed.category)) {
                score += 8;
            }

            // Puntos por keywords en nombre
            analyzed.keywords.forEach(kw => {
                if (product.name.toLowerCase().includes(kw)) {
                    score += 5;
                }
            });

            return { ...product, relevanceScore: score };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    applyFilters(results, filters) {
        let filtered = [...results];

        if (filters.brand) {
            filtered = filtered.filter(p => p.brand?.toLowerCase() === filters.brand.toLowerCase());
        }

        if (filters.category) {
            filtered = filtered.filter(p => p.category?.toLowerCase() === filters.category.toLowerCase());
        }

        if (filters.priceMin !== undefined) {
            filtered = filtered.filter(p => {
                const price = typeof p.price === 'string' ?
                    parseInt(p.price.replace(/\D/g, '')) : p.price;
                return price >= filters.priceMin;
            });
        }

        if (filters.priceMax !== undefined) {
            filtered = filtered.filter(p => {
                const price = typeof p.price === 'string' ?
                    parseInt(p.price.replace(/\D/g, '')) : p.price;
                return price <= filters.priceMax;
            });
        }

        return filtered;
    }

    // ====================================
    // BÚSQUEDA POR IMAGEN
    // ====================================

    setupImageSearch() {
        // Este método se activará cuando el usuario suba una imagen
        console.log('Image search configurado');
    }

    async searchByImage(imageFile) {
        console.log('Búsqueda por imagen:', imageFile.name);

        // Mostrar loading
        this.showLoading('Analizando imagen...');

        try {
            // En producción: enviar a API de reconocimiento de imágenes
            // Google Vision API, AWS Rekognition, o modelo propio

            // Simulación: extraer "características" de la imagen
            const features = await this.extractImageFeatures(imageFile);

            // Buscar productos similares
            const results = this.findSimilarProducts(features);

            this.hideLoading();
            return results;

        } catch (error) {
            console.error('Error en búsqueda por imagen:', error);
            this.hideLoading();
            alert('Error al analizar la imagen. Intenta con otra foto.');
            return [];
        }
    }

    async extractImageFeatures(imageFile) {
        // Simulación de extracción de características
        // En producción: usar TensorFlow.js o API externa

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Simulamos que detectamos:
                // - Color dominante
                // - Forma (circular = llanta, rectangular = batería)
                // - Tamaño aproximado

                setTimeout(() => {
                    resolve({
                        colors: ['black', 'silver'],
                        shape: 'circular',
                        category: 'llanta', // Predicción simulada
                        confidence: 0.85
                    });
                }, 2000);
            };
            reader.readAsDataURL(imageFile);
        });
    }

    findSimilarProducts(features) {
        const allProducts = window.chatbot?.products || [];

        // Buscar productos de la categoría detectada
        let results = allProducts.filter(p =>
            p.category?.toLowerCase().includes(features.category)
        );

        // Limitar a 10 resultados
        return results.slice(0, 10);
    }

    // ====================================
    // BÚSQUEDA POR VOZ
    // ====================================

    setupVoiceSearch() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.lang = 'es-CO';
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voz reconocida:', transcript);
                this.onVoiceSearchResult(transcript);
            };

            this.voiceRecognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
            };
        }
    }

    startVoiceSearch() {
        if (!this.voiceRecognition) {
            alert('Tu navegador no soporta búsqueda por voz');
            return;
        }

        this.showVoiceListening();
        this.voiceRecognition.start();
    }

    onVoiceSearchResult(transcript) {
        this.hideVoiceListening();

        // Buscar con el texto reconocido
        this.searchAdvanced(transcript).then(results => {
            this.displayResults(results, `Resultados para: "${transcript}"`);
        });
    }

    showVoiceListening() {
        // Mostrar indicador de escucha
        const indicator = document.createElement('div');
        indicator.id = 'voice-listening';
        indicator.className = 'voice-listening';
        indicator.innerHTML = `
            <div class="voice-animation"></div>
            <p>Escuchando...</p>
            <button onclick="window.searchAI.stopVoiceSearch()">Cancelar</button>
        `;
        document.body.appendChild(indicator);
    }

    hideVoiceListening() {
        document.getElementById('voice-listening')?.remove();
    }

    stopVoiceSearch() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        this.hideVoiceListening();
    }

    // ====================================
    // BÚSQUEDA POR COMPATIBILIDAD
    // ====================================

    searchByCompatibility(motorcycle) {
        // motorcycle = { brand: 'Yamaha', model: 'FZ16', year: 2020 }

        const compatible = this.findCompatibleParts(motorcycle);

        return compatible;
    }

    findCompatibleParts(motorcycle) {
        // Base de datos de compatibilidad (en producción sería una BD real)
        const compatibilityDB = {
            'Yamaha FZ16': ['llanta-yamaha-fz16', 'bateria-ytx9-bs', 'aceite-yamalube-20w50', 'cadena-428h-120l'],
            'Honda CB190': ['llanta-honda-cb190', 'bateria-ytx7a-bs', 'aceite-motul-7100-10w40'],
            'Suzuki GN125': ['bateria-ytx7a-bs', 'aceite-yamalube-20w50']
        };

        const key = `${motorcycle.brand} ${motorcycle.model}`;
        const compatibleSkus = compatibilityDB[key] || [];

        // Buscar productos compatibles en inventario
        const inventory = window.inventorySystem?.getInventory() || {};
        const compatible = [];

        Object.entries(inventory).forEach(([sku, product]) => {
            if (compatibleSkus.includes(sku) ||
                product.brand?.toLowerCase() === motorcycle.brand.toLowerCase()) {
                compatible.push(product);
            }
        });

        return compatible;
    }

    // ====================================
    // AUTOCOMPLETADO
    // ====================================

    setupAutocomplete() {
        // Se conectará al input de búsqueda
        console.log('Autocompletado configurado');
    }

    getAutocompleteSuggestions(partial) {
        // Sugerencias basadas en:
        // 1. Historial de búsquedas
        // 2. Productos populares
        // 3. Búsquedas recientes de otros usuarios

        const suggestions = [];

        // Del historial
        const fromHistory = this.searchHistory
            .filter(h => h.query.toLowerCase().includes(partial.toLowerCase()))
            .slice(0, 3)
            .map(h => ({ text: h.query, type: 'history' }));

        suggestions.push(...fromHistory);

        // Productos populares que coincidan
        const popular = [
            'llanta yamaha',
            'batería honda',
            'aceite 20w50',
            'cadena 428h',
            'frenos delanteros'
        ].filter(p => p.includes(partial.toLowerCase()))
         .map(p => ({ text: p, type: 'popular' }));

        suggestions.push(...popular);

        return suggestions.slice(0, 5);
    }

    // ====================================
    // FILTROS AVANZADOS
    // ====================================

    setFilter(filterName, value) {
        this.filters[filterName] = value;
    }

    clearFilters() {
        this.filters = {};
    }

    getActiveFilters() {
        return { ...this.filters };
    }

    // ====================================
    // HISTORIAL
    // ====================================

    addToHistory(query, resultsCount) {
        this.searchHistory.unshift({
            query,
            resultsCount,
            timestamp: Date.now()
        });

        // Mantener solo últimas 50 búsquedas
        this.searchHistory = this.searchHistory.slice(0, 50);
        this.saveHistory();
    }

    getHistory() {
        return this.searchHistory;
    }

    clearHistory() {
        this.searchHistory = [];
        this.saveHistory();
    }

    // ====================================
    // UI HELPERS
    // ====================================

    displayResults(results, title) {
        // Este método será llamado por la UI para mostrar resultados
        console.log(`${title}: ${results.length} productos encontrados`);

        const event = new CustomEvent('searchResults', {
            detail: { results, title }
        });
        window.dispatchEvent(event);
    }

    showLoading(message) {
        let loader = document.getElementById('search-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'search-loader';
            loader.className = 'search-loader';
            document.body.appendChild(loader);
        }
        loader.innerHTML = `
            <div class="loader-spinner"></div>
            <p>${message}</p>
        `;
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('search-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// Inicializar
if (typeof window !== 'undefined') {
    window.searchAI = new SearchAIAdvanced();
}
