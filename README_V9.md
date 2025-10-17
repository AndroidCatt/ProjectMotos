# 📱 Chatbot Repuestos Motos - Versión 9.0 Enterprise

**Nivel 9: Machine Learning, i18n, Analytics Avanzado y Chat en Tiempo Real**

## 🚀 Nuevas Funcionalidades v9.0

### 1. 🤖 Machine Learning Recommendations (ml-recommendations.js)
Motor de recomendaciones con inteligencia artificial para sugerencias personalizadas.

**Características:**
- **Vectorización de productos** con análisis de características
- **Filtrado colaborativo** usando correlación de Pearson
- **Filtrado basado en contenido** con similitud de coseno
- **Recomendaciones híbridas** (contenido + colaborativo)
- **Tracking de comportamiento** (vistas, compras)
- **Recomendaciones por popularidad**
- **Productos similares** con score de similitud

**Cómo usar:**
```javascript
// Obtener recomendaciones personalizadas
const recommendations = mlEngine.getPersonalizedRecommendations(userId, {
    limit: 10,
    minScore: 0.5
});

// Encontrar productos similares
const similar = mlEngine.findSimilarProducts(productId, 5);

// Trackear vista de producto
mlEngine.trackProductView(userId, productId, productData);

// Trackear compra
mlEngine.trackPurchase(userId, productId, productData);
```

### 2. 🌍 Internacionalización - i18n (i18n-system.js)
Sistema completo de multi-idioma para alcance internacional.

**Idiomas soportados:**
- 🇪🇸 Español (es)
- 🇬🇧 English (en)
- 🇧🇷 Português (pt)
- 🇫🇷 Français (fr)

**Características:**
- **Detección automática** de idioma del navegador
- **Interpolación de parámetros** en traducciones
- **Formateo de fechas/números** según locale
- **Formateo de moneda** multi-divisa
- **Actualización dinámica** de UI
- **Traducciones anidadas** con dot notation

**Cómo usar:**
```javascript
// Cambiar idioma
window.i18n.setLanguage('en');

// Obtener traducción
const text = window.i18n.t('products.search.placeholder');

// Con parámetros
const welcome = window.i18n.t('messages.welcome', { name: 'Juan' });

// Formatear número
const price = window.i18n.formatNumber(150000, { style: 'currency' });

// Formatear fecha
const date = window.i18n.formatDate(new Date(), { dateStyle: 'full' });
```

### 3. 📊 Analytics Avanzado (analytics-advanced.js)
Sistema de analíticas empresariales con funnels, A/B testing y segmentación.

**Características:**
- **Auto-tracking** de eventos (clicks, scroll, tiempo)
- **Funnels de conversión** con tasas por paso
- **Segmentación de usuarios** (nuevos, activos, high-value, at-risk)
- **A/B Testing** con asignación de variantes
- **Dashboard de métricas** (usuarios, sesiones, bounce rate)
- **Exportación** a JSON/CSV

**Cómo usar:**
```javascript
// Trackear evento personalizado
window.analytics.trackEvent('add_to_cart', { productId: 123, price: 50000 });

// Analizar funnel de conversión
const funnel = window.analytics.getFunnelAnalysis('purchase', startDate, endDate);

// Crear experimento A/B
window.analytics.createExperiment('button_color', ['red', 'blue', 'green']);

// Asignar variante a usuario
const variant = window.analytics.assignVariant('button_color', userId);

// Trackear conversión
window.analytics.trackConversion('button_color', userId);

// Ver resultados del experimento
const results = window.analytics.getExperimentResults('button_color');

// Exportar analytics
const data = window.analytics.exportAnalytics('csv');
```

### 4. 💬 Chat en Tiempo Real (realtime-chat.js)
Sistema de chat multi-usuario con typing indicators y presencia online.

**Características:**
- **WebSocket simulado** con localStorage
- **Presencia online** en tiempo real
- **Typing indicators** (quién está escribiendo)
- **Reacciones a mensajes** con emojis
- **Editar/eliminar mensajes** propios
- **Salas/rooms** multi-channel
- **Notificaciones desktop** cuando está inactivo
- **Exportar historial** de chat

**Cómo usar:**
```javascript
// Enviar mensaje
realtimeChat.sendMessage('Hola a todos!');

// Unirse a una sala
realtimeChat.joinRoom('soporte-tecnico');

// Agregar reacción
realtimeChat.addReaction(messageId, '👍');

// Editar mensaje
realtimeChat.editMessage(messageId, 'Mensaje corregido');

// Obtener usuarios en sala
const users = realtimeChat.getRoomUsers('general');

// Exportar chat
const chatHistory = realtimeChat.exportChat('general', 'text');
```

### 5. 🔌 Backend API REST (server-api.js)
Servidor backend completo con Express, SQLite y autenticación JWT.

**Características:**
- **Express.js** con middleware completo
- **SQLite** database integrada
- **JWT Authentication** con tokens seguros
- **Rate limiting** para prevenir abuso
- **Helmet** para seguridad HTTP
- **CORS** configurado
- **Rutas admin** protegidas
- **CRUD completo** productos/pedidos/usuarios/reviews

**Endpoints principales:**

**Autenticación:**
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

**Productos:**
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

**Pedidos:**
- `GET /api/orders` - Mis pedidos
- `GET /api/orders/:id` - Detalle de pedido
- `POST /api/orders` - Crear pedido
- `PATCH /api/orders/:id/status` - Actualizar estado (admin)

**Reviews:**
- `GET /api/reviews/product/:productId` - Reviews de producto
- `POST /api/reviews` - Crear review
- `PATCH /api/reviews/:id/helpful` - Marcar como útil

**Admin:**
- `GET /api/admin/stats` - Estadísticas generales
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/orders` - Todos los pedidos

**Cómo iniciar el servidor:**
```bash
node server-api.js
```

El servidor corre en `http://localhost:3000`

## 📁 Nuevos Archivos (2,900+ líneas)

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| `server-api.js` | 650+ | Backend API REST completo |
| `ml-recommendations.js` | 450+ | Motor ML de recomendaciones |
| `i18n-system.js` | 650+ | Sistema multi-idioma |
| `analytics-advanced.js` | 400+ | Analytics empresarial |
| `realtime-chat.js` | 380+ | Chat en tiempo real |
| `app-v9.js` | 380+ | Integración nivel 9 |

## 🎯 Integración en index.html

La versión 9.0 está completamente integrada en `index.html` con:

1. **Scripts cargados** (antes de `</body>`):
```html
<script src="ml-recommendations.js"></script>
<script src="i18n-system.js"></script>
<script src="analytics-advanced.js"></script>
<script src="realtime-chat.js"></script>
<script src="app-v9.js"></script>
```

2. **Banner actualizado** con 15 características enterprise
3. **Versión actualizada** a v9.0 en header

## 🔧 Cómo Usar las Nuevas Funcionalidades

### Ver Recomendaciones ML
```javascript
// Desde consola del navegador
showMLRecommendations('user_123');

// Productos similares
showSimilarProducts('product_123');
```

### Cambiar Idioma
Clic en el botón de bandera en el header, o:
```javascript
changeLanguage('en'); // 'es', 'en', 'pt', 'fr'
```

### Abrir Chat en Tiempo Real
```javascript
openRealtimeChat();
```

### Ver Dashboard de Analytics
```javascript
openAnalyticsDashboard();
```

## 📊 Almacenamiento de Datos

Todos los datos se almacenan localmente:

- **ML Recommendations**: `localStorage.ml_user_interactions`, `ml_product_vectors`
- **i18n**: `localStorage.preferred_language`
- **Analytics**: `localStorage.analytics_events`, `ab_experiments`
- **Real-Time Chat**: `localStorage.realtime_messages`, `realtime_presence`, `realtime_typing`
- **Backend Database**: `database.db` (SQLite - cuando se inicia el servidor)

## 🚀 Iniciar el Proyecto Completo

**Frontend (solo navegador):**
```bash
# Abrir index.html en navegador
# Todas las funcionalidades frontend funcionan
```

**Frontend + Backend:**
```bash
# Terminal 1: Iniciar servidor API
node server-api.js

# Terminal 2 (opcional): Iniciar servidor de desarrollo
npm start
```

## 🔐 Credenciales de Prueba

Cuando inicias el backend, se crea un usuario admin automáticamente:

- **Usuario**: admin
- **Contraseña**: admin123
- **Rol**: admin

## 📈 Métricas del Proyecto v9.0

- **Total de líneas**: ~13,100+ líneas de código
- **Archivos JavaScript**: 23 archivos
- **Funcionalidades**: 20+ sistemas completos
- **Idiomas soportados**: 4 idiomas
- **Endpoints API**: 25+ rutas
- **Base de datos**: SQLite con 5 tablas

## 🎓 Próximos Pasos

La versión 9.0 establece una base enterprise sólida. Futuras versiones pueden incluir:

- **v10.0**: GraphQL API, Microservicios, Redis Cache
- **v11.0**: Video llamadas, Blockchain para pagos, AR/VR
- **v12.0**: AI Chatbot avanzado, IoT integration, Kubernetes deployment

## 📞 Soporte

Para personalización o soporte técnico, consulta:
- `DEVELOPER_GUIDE.md` - Guía de desarrollo completa
- `QUICK_START.md` - Inicio rápido
- Código fuente comentado en cada archivo

---

**Versión 9.0 Enterprise** - Sistema completo de e-commerce con ML, i18n, Analytics y Real-Time Chat

🚀 Generated with Claude Code - https://claude.com/claude-code
