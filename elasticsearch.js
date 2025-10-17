// Elasticsearch System - Motor de Búsqueda Avanzado v10.0
// Simulación de Elasticsearch con full-text search, fuzzy matching, aggregations

class ElasticsearchEngine {
    constructor() {
        this.indices = {};
        this.analyzers = this.defineAnalyzers();

        console.log('[Elasticsearch] Motor de búsqueda inicializado');
    }

    // ============================================
    // ANALYZERS
    // ============================================

    defineAnalyzers() {
        return {
            standard: (text) => this.standardAnalyzer(text),
            simple: (text) => this.simpleAnalyzer(text),
            spanish: (text) => this.spanishAnalyzer(text),
            ngram: (text) => this.ngramAnalyzer(text)
        };
    }

    standardAnalyzer(text) {
        // Lowercase, tokenize, remove stopwords
        return text
            .toLowerCase()
            .replace(/[^\w\sáéíóúñ]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0)
            .filter(token => !this.isStopWord(token));
    }

    simpleAnalyzer(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\sáéíóúñ]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    }

    spanishAnalyzer(text) {
        // Incluye stemming básico para español
        return this.standardAnalyzer(text).map(token => this.spanishStem(token));
    }

    ngramAnalyzer(text, n = 3) {
        const tokens = this.simpleAnalyzer(text);
        const ngrams = [];

        tokens.forEach(token => {
            for (let i = 0; i <= token.length - n; i++) {
                ngrams.push(token.substring(i, i + n));
            }
        });

        return ngrams;
    }

    isStopWord(word) {
        const stopWords = ['el', 'la', 'de', 'en', 'y', 'a', 'los', 'las', 'un', 'una', 'del', 'por', 'para', 'con', 'al'];
        return stopWords.includes(word);
    }

    spanishStem(word) {
        // Stemming básico para español
        const suffixes = ['mente', 'ción', 'ando', 'iendo', 'ador', 'adora', 'ante', 'ente'];

        for (const suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }

        return word;
    }

    // ============================================
    // INDEX MANAGEMENT
    // ============================================

    createIndex(indexName, mapping = {}) {
        this.indices[indexName] = {
            mapping,
            documents: {},
            docCount: 0,
            invertedIndex: {},
            settings: {
                analyzer: mapping.analyzer || 'standard',
                shards: mapping.shards || 1,
                replicas: mapping.replicas || 0
            }
        };

        console.log(`[Elasticsearch] Index created: ${indexName}`);
        return { acknowledged: true, index: indexName };
    }

    deleteIndex(indexName) {
        if (!this.indices[indexName]) {
            return { error: 'Index not found' };
        }

        delete this.indices[indexName];
        console.log(`[Elasticsearch] Index deleted: ${indexName}`);
        return { acknowledged: true };
    }

    indexExists(indexName) {
        return !!this.indices[indexName];
    }

    // ============================================
    // DOCUMENT OPERATIONS
    // ============================================

    index(indexName, id, document) {
        if (!this.indices[indexName]) {
            this.createIndex(indexName);
        }

        const index = this.indices[indexName];

        // Guardar documento
        index.documents[id] = {
            _id: id,
            _source: document,
            _score: null
        };

        index.docCount++;

        // Actualizar índice invertido
        this.updateInvertedIndex(indexName, id, document);

        console.log(`[Elasticsearch] Document indexed: ${indexName}/${id}`);
        return { _id: id, _index: indexName, result: 'created' };
    }

    get(indexName, id) {
        if (!this.indices[indexName]) {
            return { found: false };
        }

        const doc = this.indices[indexName].documents[id];

        if (!doc) {
            return { found: false };
        }

        return {
            found: true,
            _id: id,
            _index: indexName,
            _source: doc._source
        };
    }

    delete(indexName, id) {
        if (!this.indices[indexName]) {
            return { found: false };
        }

        const index = this.indices[indexName];

        if (!index.documents[id]) {
            return { found: false };
        }

        delete index.documents[id];
        index.docCount--;

        // Limpiar del índice invertido
        this.removeFromInvertedIndex(indexName, id);

        console.log(`[Elasticsearch] Document deleted: ${indexName}/${id}`);
        return { found: true, _id: id, result: 'deleted' };
    }

    update(indexName, id, document) {
        if (!this.indices[indexName] || !this.indices[indexName].documents[id]) {
            return { found: false };
        }

        const index = this.indices[indexName];
        const existing = index.documents[id]._source;

        // Merge con documento existente
        index.documents[id]._source = { ...existing, ...document };

        // Actualizar índice invertido
        this.updateInvertedIndex(indexName, id, index.documents[id]._source);

        console.log(`[Elasticsearch] Document updated: ${indexName}/${id}`);
        return { _id: id, result: 'updated' };
    }

    // ============================================
    // SEARCH
    // ============================================

    search(indexName, query) {
        if (!this.indices[indexName]) {
            return { hits: { total: 0, hits: [] } };
        }

        const index = this.indices[indexName];
        let results = Object.values(index.documents);

        // Aplicar query
        if (query.query) {
            results = this.applyQuery(indexName, results, query.query);
        }

        // Aplicar filtros
        if (query.filter) {
            results = this.applyFilters(results, query.filter);
        }

        // Aplicar agregaciones
        let aggregations = {};
        if (query.aggs || query.aggregations) {
            aggregations = this.applyAggregations(results, query.aggs || query.aggregations);
        }

        // Ordenar
        if (query.sort) {
            results = this.applySort(results, query.sort);
        }

        // Paginación
        const from = query.from || 0;
        const size = query.size || 10;
        const paginatedResults = results.slice(from, from + size);

        return {
            took: Math.floor(Math.random() * 50), // Simular tiempo de ejecución
            timed_out: false,
            hits: {
                total: { value: results.length, relation: 'eq' },
                max_score: results[0]?._score || null,
                hits: paginatedResults
            },
            aggregations
        };
    }

    applyQuery(indexName, documents, query) {
        const index = this.indices[indexName];
        const analyzer = this.analyzers[index.settings.analyzer];

        if (query.match_all) {
            return documents.map(doc => ({ ...doc, _score: 1.0 }));
        }

        if (query.match) {
            const field = Object.keys(query.match)[0];
            const searchText = query.match[field];
            const searchTokens = analyzer(searchText);

            return documents
                .map(doc => {
                    const fieldValue = this.getNestedValue(doc._source, field);
                    if (!fieldValue) return null;

                    const docTokens = analyzer(String(fieldValue));
                    const score = this.calculateTFIDF(searchTokens, docTokens, documents.length);

                    return score > 0 ? { ...doc, _score: score } : null;
                })
                .filter(doc => doc !== null)
                .sort((a, b) => b._score - a._score);
        }

        if (query.multi_match) {
            const searchText = query.multi_match.query;
            const fields = query.multi_match.fields;
            const searchTokens = analyzer(searchText);

            return documents
                .map(doc => {
                    let maxScore = 0;

                    fields.forEach(field => {
                        const fieldValue = this.getNestedValue(doc._source, field);
                        if (fieldValue) {
                            const docTokens = analyzer(String(fieldValue));
                            const score = this.calculateTFIDF(searchTokens, docTokens, documents.length);
                            maxScore = Math.max(maxScore, score);
                        }
                    });

                    return maxScore > 0 ? { ...doc, _score: maxScore } : null;
                })
                .filter(doc => doc !== null)
                .sort((a, b) => b._score - a._score);
        }

        if (query.term) {
            const field = Object.keys(query.term)[0];
            const value = query.term[field];

            return documents
                .filter(doc => {
                    const fieldValue = this.getNestedValue(doc._source, field);
                    return fieldValue === value;
                })
                .map(doc => ({ ...doc, _score: 1.0 }));
        }

        if (query.terms) {
            const field = Object.keys(query.terms)[0];
            const values = query.terms[field];

            return documents
                .filter(doc => {
                    const fieldValue = this.getNestedValue(doc._source, field);
                    return values.includes(fieldValue);
                })
                .map(doc => ({ ...doc, _score: 1.0 }));
        }

        if (query.range) {
            const field = Object.keys(query.range)[0];
            const range = query.range[field];

            return documents
                .filter(doc => {
                    const fieldValue = this.getNestedValue(doc._source, field);
                    if (fieldValue === undefined) return false;

                    if (range.gte !== undefined && fieldValue < range.gte) return false;
                    if (range.gt !== undefined && fieldValue <= range.gt) return false;
                    if (range.lte !== undefined && fieldValue > range.lte) return false;
                    if (range.lt !== undefined && fieldValue >= range.lt) return false;

                    return true;
                })
                .map(doc => ({ ...doc, _score: 1.0 }));
        }

        if (query.bool) {
            return this.applyBoolQuery(indexName, documents, query.bool);
        }

        if (query.fuzzy) {
            const field = Object.keys(query.fuzzy)[0];
            const value = query.fuzzy[field].value || query.fuzzy[field];
            const fuzziness = query.fuzzy[field].fuzziness || 'AUTO';

            return documents
                .map(doc => {
                    const fieldValue = this.getNestedValue(doc._source, field);
                    if (!fieldValue) return null;

                    const distance = this.levenshteinDistance(String(fieldValue).toLowerCase(), String(value).toLowerCase());
                    const maxDistance = fuzziness === 'AUTO' ? 2 : fuzziness;

                    if (distance <= maxDistance) {
                        const score = 1.0 / (1 + distance);
                        return { ...doc, _score: score };
                    }

                    return null;
                })
                .filter(doc => doc !== null)
                .sort((a, b) => b._score - a._score);
        }

        return documents;
    }

    applyBoolQuery(indexName, documents, boolQuery) {
        let results = documents;

        // Must (AND)
        if (boolQuery.must) {
            const mustQueries = Array.isArray(boolQuery.must) ? boolQuery.must : [boolQuery.must];

            mustQueries.forEach(q => {
                results = this.applyQuery(indexName, results, q);
            });
        }

        // Should (OR)
        if (boolQuery.should) {
            const shouldQueries = Array.isArray(boolQuery.should) ? boolQuery.should : [boolQuery.should];
            const shouldResults = new Set();

            shouldQueries.forEach(q => {
                const matches = this.applyQuery(indexName, documents, q);
                matches.forEach(doc => shouldResults.add(doc._id));
            });

            results = results.filter(doc => shouldResults.has(doc._id));
        }

        // Must Not (NOT)
        if (boolQuery.must_not) {
            const mustNotQueries = Array.isArray(boolQuery.must_not) ? boolQuery.must_not : [boolQuery.must_not];
            const excludeIds = new Set();

            mustNotQueries.forEach(q => {
                const matches = this.applyQuery(indexName, documents, q);
                matches.forEach(doc => excludeIds.add(doc._id));
            });

            results = results.filter(doc => !excludeIds.has(doc._id));
        }

        // Filter
        if (boolQuery.filter) {
            results = this.applyFilters(results, boolQuery.filter);
        }

        return results;
    }

    applyFilters(documents, filters) {
        const filterArray = Array.isArray(filters) ? filters : [filters];

        return documents.filter(doc => {
            return filterArray.every(filter => {
                if (filter.term) {
                    const field = Object.keys(filter.term)[0];
                    const value = filter.term[field];
                    return this.getNestedValue(doc._source, field) === value;
                }

                if (filter.range) {
                    const field = Object.keys(filter.range)[0];
                    const range = filter.range[field];
                    const fieldValue = this.getNestedValue(doc._source, field);

                    if (range.gte !== undefined && fieldValue < range.gte) return false;
                    if (range.lte !== undefined && fieldValue > range.lte) return false;

                    return true;
                }

                return true;
            });
        });
    }

    applyAggregations(documents, aggregations) {
        const results = {};

        Object.keys(aggregations).forEach(aggName => {
            const agg = aggregations[aggName];

            if (agg.terms) {
                results[aggName] = this.termsAggregation(documents, agg.terms.field, agg.terms.size || 10);
            }

            if (agg.avg) {
                results[aggName] = this.avgAggregation(documents, agg.avg.field);
            }

            if (agg.sum) {
                results[aggName] = this.sumAggregation(documents, agg.sum.field);
            }

            if (agg.min) {
                results[aggName] = this.minAggregation(documents, agg.min.field);
            }

            if (agg.max) {
                results[aggName] = this.maxAggregation(documents, agg.max.field);
            }

            if (agg.stats) {
                results[aggName] = this.statsAggregation(documents, agg.stats.field);
            }

            if (agg.histogram) {
                results[aggName] = this.histogramAggregation(documents, agg.histogram.field, agg.histogram.interval);
            }
        });

        return results;
    }

    termsAggregation(documents, field, size) {
        const counts = {};

        documents.forEach(doc => {
            const value = this.getNestedValue(doc._source, field);
            if (value !== undefined) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });

        const buckets = Object.entries(counts)
            .map(([key, doc_count]) => ({ key, doc_count }))
            .sort((a, b) => b.doc_count - a.doc_count)
            .slice(0, size);

        return {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets
        };
    }

    avgAggregation(documents, field) {
        const values = documents
            .map(doc => this.getNestedValue(doc._source, field))
            .filter(v => typeof v === 'number');

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = values.length > 0 ? sum / values.length : null;

        return { value: avg };
    }

    sumAggregation(documents, field) {
        const sum = documents
            .map(doc => this.getNestedValue(doc._source, field))
            .filter(v => typeof v === 'number')
            .reduce((a, b) => a + b, 0);

        return { value: sum };
    }

    minAggregation(documents, field) {
        const values = documents
            .map(doc => this.getNestedValue(doc._source, field))
            .filter(v => typeof v === 'number');

        return { value: values.length > 0 ? Math.min(...values) : null };
    }

    maxAggregation(documents, field) {
        const values = documents
            .map(doc => this.getNestedValue(doc._source, field))
            .filter(v => typeof v === 'number');

        return { value: values.length > 0 ? Math.max(...values) : null };
    }

    statsAggregation(documents, field) {
        const values = documents
            .map(doc => this.getNestedValue(doc._source, field))
            .filter(v => typeof v === 'number');

        if (values.length === 0) {
            return { count: 0, min: null, max: null, avg: null, sum: null };
        }

        const sum = values.reduce((a, b) => a + b, 0);

        return {
            count: values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            avg: sum / values.length,
            sum
        };
    }

    histogramAggregation(documents, field, interval) {
        const buckets = {};

        documents.forEach(doc => {
            const value = this.getNestedValue(doc._source, field);
            if (typeof value === 'number') {
                const bucketKey = Math.floor(value / interval) * interval;
                buckets[bucketKey] = (buckets[bucketKey] || 0) + 1;
            }
        });

        return {
            buckets: Object.entries(buckets)
                .map(([key, doc_count]) => ({ key: parseFloat(key), doc_count }))
                .sort((a, b) => a.key - b.key)
        };
    }

    applySort(documents, sort) {
        const sortArray = Array.isArray(sort) ? sort : [sort];

        return documents.sort((a, b) => {
            for (const sortItem of sortArray) {
                const field = Object.keys(sortItem)[0];
                const order = sortItem[field].order || sortItem[field] || 'asc';

                const aVal = this.getNestedValue(a._source, field);
                const bVal = this.getNestedValue(b._source, field);

                if (aVal === bVal) continue;

                const comparison = aVal < bVal ? -1 : 1;
                return order === 'asc' ? comparison : -comparison;
            }

            return 0;
        });
    }

    // ============================================
    // INVERTED INDEX
    // ============================================

    updateInvertedIndex(indexName, docId, document) {
        const index = this.indices[indexName];
        const analyzer = this.analyzers[index.settings.analyzer];

        // Indexar todos los campos de texto
        Object.entries(document).forEach(([field, value]) => {
            if (typeof value === 'string') {
                const tokens = analyzer(value);

                tokens.forEach(token => {
                    if (!index.invertedIndex[token]) {
                        index.invertedIndex[token] = new Set();
                    }
                    index.invertedIndex[token].add(docId);
                });
            }
        });
    }

    removeFromInvertedIndex(indexName, docId) {
        const index = this.indices[indexName];

        Object.values(index.invertedIndex).forEach(docSet => {
            docSet.delete(docId);
        });
    }

    // ============================================
    // SCORING (TF-IDF)
    // ============================================

    calculateTFIDF(queryTokens, docTokens, totalDocs) {
        let score = 0;

        queryTokens.forEach(queryToken => {
            // Term Frequency
            const tf = docTokens.filter(t => t === queryToken).length / docTokens.length;

            // Inverse Document Frequency (simplificado)
            const idf = Math.log(totalDocs / (1 + this.getDocumentFrequency(queryToken)));

            score += tf * idf;
        });

        return score;
    }

    getDocumentFrequency(token) {
        // En implementación real, esto vendría del índice invertido
        return 1;
    }

    // ============================================
    // FUZZY MATCHING
    // ============================================

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    // ============================================
    // UTILITIES
    // ============================================

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    bulkIndex(indexName, documents) {
        const results = [];

        documents.forEach(doc => {
            const result = this.index(indexName, doc.id || Date.now().toString(), doc);
            results.push(result);
        });

        console.log(`[Elasticsearch] Bulk indexed ${results.length} documents`);
        return { items: results };
    }
}

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.ElasticsearchEngine = ElasticsearchEngine;
    window.elasticsearch = new ElasticsearchEngine();
}
