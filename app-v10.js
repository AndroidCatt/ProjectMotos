// App V10.0 - Integración GraphQL, Redis Cache, Elasticsearch y WebSocket Real
// Conecta todas las funcionalidades Enterprise avanzadas del nivel 10

// Inicializar sistemas del nivel 10
let graphqlAPI;
let redisCache;
let elasticsearch;
let wsClient;

// ============================================
// INICIALIZACIÓN NIVEL 10
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('[V10] Inicializando funcionalidades del nivel 10...');

    // Inicializar GraphQL API
    graphqlAPI = window.graphqlAPI;

    // Inicializar Redis Cache
    redisCache = window.redisCache;

    // Inicializar Elasticsearch
    elasticsearch = window.elasticsearch;

    // Inicializar WebSocket Client (si el servidor está disponible)
    initializeWebSocket();

    // Configurar búsqueda avanzada
    setupAdvancedSearch();

    // Configurar cache para productos
    setupProductCache();

    // Indexar productos en Elasticsearch
    indexProductsInElasticsearch();

    console.log('[V10] Nivel 10 inicializado correctamente');
    console.log('[V10] Sistemas activos:', {
        GraphQL: !!graphqlAPI,
        Redis: !!redisCache,
        Elasticsearch: !!elasticsearch,
        WebSocket: !!wsClient
    });
});

// ============================================
// WEBSOCKET CLIENT
// ============================================

function initializeWebSocket() {
    // Intentar conectar al servidor WebSocket
    try {
        wsClient = new WebSocket('ws://localhost:8080');

        wsClient.onopen = () => {
            console.log('[WebSocket] Conectado al servidor');

            // Autenticar
            const user = window.authSystem?.getCurrentUser();
            if (user) {
                wsClient.send(JSON.stringify({
                    type: 'auth',
                    userId: user.id,
                    username: user.username
                }));
            }
        };

        wsClient.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleWebSocketMessage(data);
        };

        wsClient.onerror = (error) => {
            console.warn('[WebSocket] Servidor no disponible, modo offline');
        };

        wsClient.onclose = () => {
            console.log('[WebSocket] Desconectado - Funcionando en modo offline');
            // NO reconectar automáticamente para evitar spam de errores
            wsClient = null;
        };
    } catch (error) {
        console.warn('[WebSocket] Servidor no disponible, usando modo simulado');
        wsClient = null;
    }
}

function handleWebSocketMessage(data) {
    console.log('[WebSocket] Mensaje recibido:', data.type);

    switch (data.type) {
        case 'connected':
            console.log('[WebSocket] ID de cliente:', data.clientId);
            break;

        case 'chat_message':
            displayRealtimeChatMessage(data);
            break;

        case 'order_updated':
            handleOrderUpdate(data.order);
            break;

        case 'notification':
            showNotification(data.notification.title, data.notification.type);
            break;

        case 'user_joined':
            console.log('[WebSocket] Usuario se unió:', data.username);
            break;

        case 'typing_start':
            showTypingIndicator(data.username);
            break;

        case 'typing_stop':
            hideTypingIndicator(data.username);
            break;
    }
}

function sendWebSocketMessage(type, data) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify({ type, ...data }));
    } else {
        console.warn('[WebSocket] No conectado, usando modo simulado');
    }
}

// ============================================
// GRAPHQL QUERIES
// ============================================

async function searchProductsGraphQL(query) {
    const graphqlQuery = `
        query SearchProducts($query: String!) {
            searchProducts(query: $query) {
                id
                name
                description
                price
                brand
                category
                image
                stock
                rating
                reviewCount
            }
        }
    `;

    try {
        const result = await graphqlAPI.executeQuery(graphqlQuery, { query });
        return result.data?.searchProducts || [];
    } catch (error) {
        console.error('[GraphQL] Error en búsqueda:', error);
        return [];
    }
}

async function getProductDetailsGraphQL(productId) {
    // Primero intentar obtener de cache
    const cached = redisCache.get(`product:${productId}`);
    if (cached) {
        console.log('[Cache] Product HIT:', productId);
        return cached;
    }

    console.log('[Cache] Product MISS:', productId);

    // Si no está en cache, usar GraphQL
    const product = graphqlAPI.resolvers.Query.product(null, { id: productId });

    if (product) {
        // Guardar en cache por 1 hora
        redisCache.set(`product:${productId}`, product, 3600);
    }

    return product;
}

async function createOrderGraphQL(orderInput) {
    const mutation = `
        mutation CreateOrder($input: OrderInput!) {
            createOrder(input: $input) {
                id
                total
                status
                createdAt
            }
        }
    `;

    try {
        const result = await graphqlAPI.resolvers.Mutation.createOrder(null, { input: orderInput });

        // Invalidar cache del carrito
        redisCache.del(`cart:${window.authSystem?.getCurrentUser()?.id}`);

        // Notificar vía WebSocket
        if (wsClient) {
            sendWebSocketMessage('order_created', { orderId: result.id });
        }

        return result;
    } catch (error) {
        console.error('[GraphQL] Error al crear pedido:', error);
        throw error;
    }
}

// ============================================
// REDIS CACHE
// ============================================

function setupProductCache() {
    // Interceptar addToCart para usar cache
    const originalAddToCart = window.addToCart;

    window.addToCart = function(product) {
        // Guardar carrito en cache con TTL de 24 horas
        const userId = window.authSystem?.getCurrentUser()?.id || 'guest';
        const cart = redisCache.get(`cart:${userId}`) || { items: [] };

        // Agregar producto
        const existingItem = cart.items.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.items.push({ ...product, quantity: 1 });
        }

        redisCache.set(`cart:${userId}`, cart, 86400); // 24 horas

        console.log('[Cache] Carrito actualizado:', userId);

        // Llamar función original
        if (originalAddToCart) {
            originalAddToCart(product);
        }
    };
}

function getCachedCart() {
    const userId = window.authSystem?.getCurrentUser()?.id || 'guest';
    return redisCache.get(`cart:${userId}`) || { items: [] };
}

function clearCachedCart() {
    const userId = window.authSystem?.getCurrentUser()?.id || 'guest';
    redisCache.del(`cart:${userId}`);
}

// Cache popular queries
function cachePopularSearches() {
    const popularSearches = ['filtro', 'aceite', 'llanta', 'bateria', 'frenos'];

    popularSearches.forEach(async (term) => {
        const cacheKey = `search:${term}`;

        await redisCache.cacheAside(cacheKey, async () => {
            return searchWithElasticsearch(term);
        }, 3600); // 1 hora
    });

    console.log('[Cache] Búsquedas populares pre-cacheadas');
}

// ============================================
// ELASTICSEARCH
// ============================================

function indexProductsInElasticsearch() {
    // Crear índice si no existe
    if (!elasticsearch.indexExists('products')) {
        elasticsearch.createIndex('products', {
            analyzer: 'spanish',
            shards: 1,
            replicas: 0
        });
    }

    // Indexar productos
    if (window.products) {
        window.products.forEach(product => {
            elasticsearch.index('products', product.id.toString(), {
                id: product.id,
                name: product.name,
                description: product.description || '',
                brand: product.brand,
                category: product.category,
                price: product.price,
                stock: product.stock || 0,
                tags: product.tags || []
            });
        });

        console.log('[Elasticsearch] Productos indexados:', window.products.length);
    }
}

function setupAdvancedSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Debounce para no hacer búsquedas en cada tecla
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        const query = e.target.value.trim();

        if (query.length < 2) return;

        searchTimeout = setTimeout(() => {
            performAdvancedSearch(query);
        }, 300);
    });
}

async function performAdvancedSearch(query) {
    // Intentar obtener de cache primero
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = redisCache.get(cacheKey);

    if (cached) {
        console.log('[Cache] Search HIT:', query);
        displaySearchResults(cached);
        return;
    }

    console.log('[Cache] Search MISS:', query);

    // Buscar con Elasticsearch
    const results = await searchWithElasticsearch(query);

    // Guardar en cache por 30 minutos
    redisCache.set(cacheKey, results, 1800);

    displaySearchResults(results);
}

function searchWithElasticsearch(query) {
    const searchQuery = {
        query: {
            bool: {
                should: [
                    {
                        multi_match: {
                            query: query,
                            fields: ['name^3', 'description', 'brand^2', 'category'],
                            fuzziness: 'AUTO'
                        }
                    },
                    {
                        fuzzy: {
                            name: {
                                value: query,
                                fuzziness: 2
                            }
                        }
                    }
                ]
            }
        },
        size: 20,
        aggs: {
            categories: {
                terms: {
                    field: 'category',
                    size: 10
                }
            },
            brands: {
                terms: {
                    field: 'brand',
                    size: 10
                }
            },
            price_ranges: {
                histogram: {
                    field: 'price',
                    interval: 50000
                }
            }
        }
    };

    const result = elasticsearch.search('products', searchQuery);

    console.log('[Elasticsearch] Búsqueda:', {
        query,
        results: result.hits.total.value,
        took: result.took + 'ms'
    });

    return {
        products: result.hits.hits.map(hit => hit._source),
        aggregations: result.aggregations,
        total: result.hits.total.value
    };
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    if (!container) return;

    container.innerHTML = '';

    if (results.total === 0) {
        container.innerHTML = '<p>No se encontraron resultados</p>';
        return;
    }

    // Mostrar productos
    results.products.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });

    // Mostrar agregaciones (filtros)
    if (results.aggregations) {
        displaySearchFacets(results.aggregations);
    }

    console.log('[Search] Mostrando', results.products.length, 'resultados');
}

function displaySearchFacets(aggregations) {
    const facetsContainer = document.getElementById('search-facets');
    if (!facetsContainer) return;

    facetsContainer.innerHTML = '<h3>Filtros</h3>';

    // Categorías
    if (aggregations.categories) {
        const categoriesDiv = document.createElement('div');
        categoriesDiv.className = 'facet-group';
        categoriesDiv.innerHTML = '<h4>Categorías</h4>';

        aggregations.categories.buckets.forEach(bucket => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${bucket.key}">
                ${bucket.key} (${bucket.doc_count})
            `;
            categoriesDiv.appendChild(label);
        });

        facetsContainer.appendChild(categoriesDiv);
    }

    // Marcas
    if (aggregations.brands) {
        const brandsDiv = document.createElement('div');
        brandsDiv.className = 'facet-group';
        brandsDiv.innerHTML = '<h4>Marcas</h4>';

        aggregations.brands.buckets.forEach(bucket => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${bucket.key}">
                ${bucket.key} (${bucket.doc_count})
            `;
            brandsDiv.appendChild(label);
        });

        facetsContainer.appendChild(brandsDiv);
    }
}

// ============================================
// ADVANCED FEATURES
// ============================================

function showGraphQLPlayground() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'graphql-playground-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content modal-fullscreen">
            <div class="modal-header">
                <h2>🚀 GraphQL Playground</h2>
                <button class="modal-close" onclick="closeModal('graphql-playground-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="graphql-playground">
                    <div class="query-editor">
                        <h3>Query</h3>
                        <textarea id="graphql-query" rows="10" placeholder="Escribe tu query GraphQL aquí...">
query {
  products(filter: { category: "Aceites" }) {
    edges {
      node {
        id
        name
        price
        brand
      }
    }
    totalCount
  }
}
                        </textarea>
                        <button class="btn-primary" onclick="executeGraphQLQuery()">
                            Ejecutar Query
                        </button>
                    </div>
                    <div class="query-results">
                        <h3>Resultado</h3>
                        <pre id="graphql-result">// Los resultados aparecerán aquí</pre>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function executeGraphQLQuery() {
    const queryText = document.getElementById('graphql-query').value;
    const resultPre = document.getElementById('graphql-result');

    try {
        // Simular ejecución (en producción usar graphql-js)
        const result = graphqlAPI.executeQuery(queryText);
        resultPre.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        resultPre.textContent = `Error: ${error.message}`;
    }
}

function showCacheStats() {
    const stats = redisCache.info();

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'cache-stats-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📊 Redis Cache Stats</h2>
                <button class="modal-close" onclick="closeModal('cache-stats-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Keys</h3>
                        <div class="stat-value">${stats.keys}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Hit Rate</h3>
                        <div class="stat-value">${stats.hitRate}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Tamaño Total</h3>
                        <div class="stat-value">${stats.totalSize}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Max Size</h3>
                        <div class="stat-value">${stats.maxSize} keys</div>
                    </div>
                </div>

                <div class="cache-actions">
                    <button class="btn-secondary" onclick="redisCache.flushdb(); closeModal('cache-stats-modal');">
                        Limpiar Cache
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function showElasticsearchStats() {
    const products = elasticsearch.indices['products'];

    if (!products) {
        showNotification('No hay índices creados', 'info');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'elasticsearch-stats-modal';
    modal.style.display = 'block';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>🔍 Elasticsearch Stats</h2>
                <button class="modal-close" onclick="closeModal('elasticsearch-stats-modal')">✕</button>
            </div>
            <div class="modal-body">
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Documentos</h3>
                        <div class="stat-value">${products.docCount}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Analyzer</h3>
                        <div class="stat-value">${products.settings.analyzer}</div>
                    </div>
                    <div class="stat-card">
                        <h3>Shards</h3>
                        <div class="stat-value">${products.settings.shards}</div>
                    </div>
                </div>

                <div class="es-actions">
                    <button class="btn-primary" onclick="indexProductsInElasticsearch(); closeModal('elasticsearch-stats-modal');">
                        Re-indexar Productos
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function displayRealtimeChatMessage(message) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `
        <strong>${message.username}</strong>: ${message.text}
        <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
    `;

    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleOrderUpdate(order) {
    console.log('[Order] Actualización recibida:', order);

    // Invalidar cache del pedido
    redisCache.del(`order:${order.id}`);

    // Mostrar notificación
    showNotification(`Pedido ${order.id} actualizado: ${order.status}`, 'success');
}

// Hacer funciones globales
window.searchProductsGraphQL = searchProductsGraphQL;
window.getProductDetailsGraphQL = getProductDetailsGraphQL;
window.createOrderGraphQL = createOrderGraphQL;
window.performAdvancedSearch = performAdvancedSearch;
window.showGraphQLPlayground = showGraphQLPlayground;
window.executeGraphQLQuery = executeGraphQLQuery;
window.showCacheStats = showCacheStats;
window.showElasticsearchStats = showElasticsearchStats;
window.getCachedCart = getCachedCart;
window.clearCachedCart = clearCachedCart;

// Pre-cachear búsquedas populares al cargar
window.addEventListener('load', () => {
    setTimeout(cachePopularSearches, 2000);
});

console.log('[V10] app-v10.js cargado completamente');
