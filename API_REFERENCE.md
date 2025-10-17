# 📖 Referencia Rápida de APIs
## Chatbot de Repuestos para Motos v16.0

---

## 🎯 APIs Principales

### ChatBot API (chatbot.js)

```javascript
// Instancia global
const bot = new ChatBot();

// Métodos principales
bot.processMessage(message)           // Procesar mensaje del usuario
bot.searchParts(query)               // Buscar repuestos
bot.addToFavorites(part)            // Agregar a favoritos
bot.removeFromFavorites(partName)    // Quitar de favoritos
bot.addToCart(part, quantity)        // Agregar al carrito
bot.removeFromCart(partName)         // Quitar del carrito
bot.getTotalCart()                   // Obtener total del carrito
bot.reset()                          // Reiniciar chatbot

// Propiedades
bot.favorites                         // Array de favoritos
bot.cart                             // Array del carrito
bot.conversationState                // Estado conversacional
```

### Authentication API (auth-system.js)

```javascript
// Instancia global
window.authSystem

// Métodos principales
authSystem.login(username, password)              // Iniciar sesión
authSystem.register(userData)                     // Registrar usuario
authSystem.logout()                               // Cerrar sesión
authSystem.getCurrentUser()                       // Usuario actual
authSystem.isAuthenticated()                      // Verificar autenticación
authSystem.resetPassword(email)                   // Recuperar contraseña
authSystem.updateProfile(userId, updates)         // Actualizar perfil

// Datos de registro
userData = {
    fullName: string,
    username: string,
    email: string,
    phone: string,
    password: string
}

// Cuenta demo
username: 'demo'
password: 'demo123'
```

### Checkout API (checkout-system.js)

```javascript
// Instancia global
window.checkoutSystem

// Métodos principales
checkoutSystem.openCheckout()                     // Abrir checkout
checkoutSystem.processCheckout(checkoutData)      // Procesar compra
checkoutSystem.getCurrentStep()                   // Paso actual
checkoutSystem.goToStep(step)                     // Ir a paso
checkoutSystem.validateStep(step)                 // Validar paso

// Datos de checkout
checkoutData = {
    shipping: {
        address: string,
        city: string,
        phone: string,
        method: string      // 'standard' | 'express' | 'pickup' | 'sameday'
    },
    payment: {
        method: string,     // 'pse' | 'nequi' | 'daviplata' | 'card' | etc.
        // Datos específicos del método
    }
}
```

### Inventory API (inventory-system-intelligent.js)

```javascript
// Instancia global
window.inventorySystem

// Métodos principales
inventorySystem.checkStockLevels()                        // Ver alertas de stock
inventorySystem.getInventory()                            // Obtener inventario completo
inventorySystem.addMovement(sku, quantity, type, notes)   // Registrar movimiento
inventorySystem.calculatePredictions()                    // Predicciones de demanda
inventorySystem.suggestRestocking()                       // Sugerencias de reabastecimiento
inventorySystem.analyzeRotation()                         // Análisis ABC
inventorySystem.openInventoryDashboard()                  // Abrir dashboard

// Tipos de movimiento
type: 'in' | 'out' | 'adjustment'

// Niveles de alerta
{ type: 'critical', level: 'error' }    // Stock = 0
{ type: 'low', level: 'warning' }       // Stock <= minStock
{ type: 'warning', level: 'info' }      // Stock <= minStock * 2
```

### Search AI API (search-ai-advanced.js)

```javascript
// Instancia global
window.searchAI

// Métodos principales
searchAI.searchAdvanced(query, options)           // Búsqueda avanzada
searchAI.searchByImage(imageFile)                 // Búsqueda por imagen
searchAI.searchByCompatibility(motorcycle)        // Búsqueda por compatibilidad
searchAI.startVoiceSearch()                       // Iniciar búsqueda por voz
searchAI.getAutocompleteSuggestions(partial)      // Sugerencias de autocompletado
searchAI.setFilter(filterName, value)             // Establecer filtro
searchAI.clearFilters()                           // Limpiar filtros
searchAI.getHistory()                             // Obtener historial
searchAI.clearHistory()                           // Limpiar historial

// Opciones de búsqueda
options = {
    filters: {
        brand: string,
        category: string,
        priceMin: number,
        priceMax: number
    }
}

// Objeto de moto para compatibilidad
motorcycle = {
    brand: string,
    model: string,
    year: number
}
```

### WhatsApp API (whatsapp-business-integration.js)

```javascript
// Instancia global
window.whatsappBusiness

// Métodos principales
whatsappBusiness.shareProduct(product)                    // Compartir producto
whatsappBusiness.shareCart(cartItems)                     // Compartir carrito
whatsappBusiness.contactSupport(issue)                    // Contactar soporte
whatsappBusiness.requestQuote(products)                   // Solicitar cotización
whatsappBusiness.notifyOrderConfirmation(order)           // Notificar confirmación
whatsappBusiness.notifyOrderShipped(order)                // Notificar envío
whatsappBusiness.generateWhatsAppQR(message)              // Generar QR
whatsappBusiness.setBusinessPhone(phone)                  // Configurar teléfono

// Número configurado
businessPhone: '+573212018219'
```

### ML TensorFlow API (ml-tensorflow-advanced.js)

```javascript
// Instancia global
window.mlTensorFlow

// Métodos principales
mlTensorFlow.getPersonalizedRecommendations(userId, num)  // Recomendaciones
mlTensorFlow.predictPurchaseProbability(userId, productSku) // Predicción de compra
mlTensorFlow.clusterUsers(users)                          // Clustering de usuarios
mlTensorFlow.analyzeUserBehavior(userId)                  // Análisis de comportamiento

// Respuesta de recomendaciones
{
    product: Object,
    sku: string,
    score: number,          // 0-1
    reason: string
}

// Análisis de comportamiento
{
    purchaseFrequency: 'new' | 'low' | 'medium' | 'high' | 'very-high',
    avgOrderValue: number,
    favoriteProducts: Array,
    predictedNextPurchase: string,
    lifetimeValue: number,
    churnRisk: 'low' | 'medium' | 'high'
}
```

### Admin Panel API (admin-panel-advanced.js)

```javascript
// Instancia global
window.adminPanelAdvanced

// Métodos principales
adminPanelAdvanced.openAdminPanel()               // Abrir panel
adminPanelAdvanced.switchTab(tabName)             // Cambiar pestaña
adminPanelAdvanced.quickBackup()                  // Backup rápido
adminPanelAdvanced.showLogs()                     // Ver logs

// Pestañas disponibles
tabs: 'dashboard' | 'database' | 'products' | 'training' |
      'users' | 'orders' | 'config' | 'backup' | 'logs'

// Atajos de teclado
Ctrl+Shift+A    // Abrir panel
Ctrl+Shift+D    // Dashboard
Ctrl+Shift+T    // Training
Ctrl+Shift+B    // Backup rápido
```

### i18n API (i18n-system.js)

```javascript
// Instancia global
window.i18n

// Métodos principales
i18n.t(key, params)                               // Traducir
i18n.setLanguage(langCode)                        // Cambiar idioma
i18n.getCurrentLanguage()                         // Idioma actual
i18n.getSupportedLanguages()                      // Idiomas soportados

// Idiomas disponibles
'es' - Español 🇪🇸
'en' - English 🇺🇸
'pt' - Português 🇧🇷
'fr' - Français 🇫🇷

// Uso
i18n.t('chatbot.greeting')                        // "¡Hola!"
i18n.t('messages.welcome', { name: 'Juan' })      // "Bienvenido, Juan"
```

### Analytics API (analytics-advanced.js)

```javascript
// Instancia global
window.analytics

// Métodos principales
analytics.track(eventName, properties)            // Trackear evento
analytics.page(pageName)                          // Trackear página
analytics.identify(userId, traits)                // Identificar usuario
analytics.getDashboardMetrics(days)               // Métricas del dashboard
analytics.getFunnelAnalysis(funnelName)           // Análisis de funnel
analytics.getSegmentUsers(segment)                // Usuarios por segmento
analytics.exportAnalytics(format)                 // Exportar datos

// Segmentos de usuarios
'new'        // Nuevos usuarios
'active'     // Usuarios activos
'high-value' // Alto valor
'at-risk'    // En riesgo

// Formatos de exportación
'json' | 'csv'
```

---

## 🛠️ Comandos de Consola

### Nivel 14 (v14.*)

```javascript
v14.help()                    // Mostrar ayuda
v14.openAdmin()              // Abrir panel admin
v14.openTraining()           // Abrir entrenamiento
v14.openDatabase()           // Abrir base de datos
v14.backup()                 // Backup rápido
v14.testAI(message)          // Probar IA conversacional
v14.metrics()                // Ver métricas
v14.stats()                  // Ver estadísticas
```

### Nivel 16 (v16.*)

```javascript
v16.help()                          // Mostrar ayuda
v16.inventory()                     // Abrir inventario
v16.search(query)                   // Búsqueda avanzada
v16.whatsapp()                      // Contactar WhatsApp
v16.ml.recommendations(userId)      // Recomendaciones ML
```

---

## 🎨 Eventos Personalizados

### Eventos del Sistema

```javascript
// Escuchar eventos
window.addEventListener('eventName', (e) => {
    console.log(e.detail);
});

// Eventos disponibles
'product_view'          // Vista de producto
'purchase_complete'     // Compra completada
'cart_updated'          // Carrito actualizado
'user_login'            // Usuario logueado
'user_logout'           // Usuario deslogueado
'languageChanged'       // Idioma cambiado
'searchResults'         // Resultados de búsqueda

// Emitir evento personalizado
const event = new CustomEvent('mi_evento', {
    detail: { data: 'valor' }
});
window.dispatchEvent(event);
```

---

## 💾 LocalStorage Keys

### Claves Utilizadas

```javascript
// Chatbot
'chatbot_favorites'          // Favoritos del usuario
'chatbot_cart'              // Carrito de compras
'chatbot_search_history'    // Historial de búsqueda
'chatbot_history'           // Historial de conversación
'chatbot_theme'             // Tema (light/dark)

// Autenticación
'auth_currentUser'          // Usuario actual
'auth_token'                // Token de sesión
'auth_users'                // Base de datos de usuarios

// Inventario
'inventory_data'            // Datos de inventario
'inventory_movements'       // Movimientos de inventario
'inventory_suppliers'       // Proveedores

// Búsqueda
'searchHistory'             // Historial de búsquedas

// i18n
'i18n_language'             // Idioma seleccionado

// Analytics
'analytics_userId'          // ID de usuario para analytics
'analytics_events'          // Eventos trackeados

// WhatsApp
'whatsappBusinessPhone'     // Número de WhatsApp
'whatsappAPIToken'          // Token de API

// PWA
'pwa_installPrompted'       // Si ya se mostró prompt de instalación
'pwa_dismissed'             // Si usuario rechazó instalación
```

---

## 🔌 Integración con Backend

### API REST Endpoints (server-v3.js)

```javascript
// Base URL: http://localhost:3000

// Productos
GET    /api/products              // Listar productos
GET    /api/products/:id          // Obtener producto
POST   /api/products              // Crear producto
PUT    /api/products/:id          // Actualizar producto
DELETE /api/products/:id          // Eliminar producto

// Pedidos
GET    /api/orders                // Listar pedidos
GET    /api/orders/:id            // Obtener pedido
POST   /api/orders                // Crear pedido
PUT    /api/orders/:id            // Actualizar pedido

// Usuarios
POST   /api/auth/login            // Login
POST   /api/auth/register         // Registro
GET    /api/users/:id             // Obtener usuario
PUT    /api/users/:id             // Actualizar usuario

// Reviews
GET    /api/reviews/:productId    // Reviews de producto
POST   /api/reviews                // Crear review

// Inventario
GET    /api/inventory              // Obtener inventario
POST   /api/inventory/movement     // Registrar movimiento
```

### GraphQL Endpoint (graphql-api.js)

```javascript
// Endpoint: http://localhost:3000/graphql

// Queries
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

query {
  product(id: "123") {
    id
    name
    description
    price
    stock
    reviews {
      rating
      comment
    }
  }
}

// Mutations
mutation {
  createOrder(input: {
    items: [
      { productId: "123", quantity: 2 }
    ]
    shippingAddress: "..."
  }) {
    id
    total
    status
  }
}

// Subscriptions
subscription {
  orderUpdated(orderId: "123") {
    id
    status
    trackingNumber
  }
}
```

### WebSocket Events (app-v10.js)

```javascript
// URL: ws://localhost:8080

// Eventos del cliente
{
  type: 'auth',
  userId: string,
  username: string
}

{
  type: 'chat_message',
  text: string,
  room: string
}

{
  type: 'typing_start' | 'typing_stop'
}

// Eventos del servidor
{
  type: 'connected',
  clientId: string
}

{
  type: 'chat_message',
  username: string,
  text: string,
  timestamp: number
}

{
  type: 'order_updated',
  order: Object
}

{
  type: 'notification',
  notification: {
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error'
  }
}
```

---

## 🧪 Testing

### Unit Tests (Jest)

```javascript
// Ejemplo: __tests__/chatbot.test.js

describe('ChatBot', () => {
  let bot;

  beforeEach(() => {
    bot = new ChatBot();
  });

  test('should initialize correctly', () => {
    expect(bot.conversationState.step).toBe('greeting');
  });

  test('should process greeting', () => {
    const response = bot.processMessage('hola');
    expect(response.card).toBeDefined();
    expect(response.card.type).toBe('brand');
  });

  test('should search parts', () => {
    const results = bot.searchParts('filtro');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Cypress)

```javascript
// Ejemplo: cypress/e2e/checkout.cy.js

describe('Checkout Flow', () => {
  it('should complete purchase', () => {
    cy.visit('/')

    // Login
    cy.get('#user-menu-btn').click()
    cy.get('#login-btn').click()
    cy.get('#login-username').type('demo')
    cy.get('#login-password').type('demo123')
    cy.get('#login-form').submit()

    // Add to cart
    cy.contains('Comenzar').click()
    cy.contains('Auteco').click()
    cy.contains('Discover 125').click()
    cy.contains('Motor').click()
    cy.get('.cart-btn').first().click()

    // Checkout
    cy.get('#cart-btn').click()
    cy.contains('Finalizar Compra').click()

    // Fill shipping
    cy.get('#shipping-address').type('Calle 123')
    cy.get('#shipping-city').type('Bogotá')
    cy.get('#shipping-phone').type('3001234567')

    // Continue...
  })
})
```

---

## 📊 Métricas y Analytics

### Métricas Disponibles

```javascript
// Dashboard Metrics
{
  uniqueUsers: number,
  sessions: number,
  pageViews: number,
  bounceRate: string,
  avgSessionDuration: string,
  topEvents: [
    { event: string, count: number }
  ]
}

// Funnel Analysis
{
  name: string,
  steps: [
    {
      name: string,
      users: number,
      conversionRate: string,
      dropoffRate: string
    }
  ]
}

// User Segments
{
  new: number,        // Usuarios nuevos
  active: number,     // Usuarios activos (últimos 7 días)
  'high-value': number, // Alto valor (>$500k)
  'at-risk': number   // En riesgo (>30 días sin actividad)
}
```

---

## 🔐 Seguridad

### Mejores Prácticas

```javascript
// 1. Sanitización de Input
function sanitizeInput(input) {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Prevenir XSS
    .substring(0, 500);     // Limitar longitud
}

// 2. Validación de Datos
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// 3. Encriptación de Contraseñas (ejemplo)
// En producción, usar bcrypt en backend
function hashPassword(password) {
  // NO usar en producción
  return btoa(password);
}

// 4. Rate Limiting
const rateLimiter = {
  attempts: {},
  check(userId, limit = 5, window = 60000) {
    const now = Date.now();
    if (!this.attempts[userId]) {
      this.attempts[userId] = [];
    }

    // Limpiar intentos antiguos
    this.attempts[userId] = this.attempts[userId]
      .filter(time => now - time < window);

    if (this.attempts[userId].length >= limit) {
      return false;  // Bloqueado
    }

    this.attempts[userId].push(now);
    return true;  // Permitido
  }
};
```

---

## 🚀 Performance

### Optimizaciones Aplicadas

```javascript
// 1. Debouncing (búsqueda)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(e.target.value);
  }, 300);
});

// 2. Throttling (scroll)
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (!scrollTimeout) {
    scrollTimeout = setTimeout(() => {
      handleScroll();
      scrollTimeout = null;
    }, 100);
  }
});

// 3. Lazy Loading (imágenes)
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

// 4. Memoización
const memoize = (fn) => {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
};

const expensiveCalculation = memoize((n) => {
  // Cálculo costoso
  return n * 2;
});
```

---

**Fin de la Referencia de APIs**

Para documentación completa, consulta `DOCUMENTACION_PROYECTO.md`
