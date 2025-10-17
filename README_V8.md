# 📱 ChatBot Repuestos v8.0 - PWA y Funcionalidades Avanzadas

## 🚀 Novedades del Nivel 8

### Progressive Web App (PWA)
- ✅ **Service Worker** completo con estrategias de caché inteligentes
- ✅ **Modo Offline** - Funciona sin conexión a Internet
- ✅ **Instalable** - Puede instalarse como app nativa en dispositivos
- ✅ **Manifest.json** configurado con iconos y shortcuts
- ✅ **Sincronización en background** para datos pendientes

### Sistema de Notificaciones Push
- ✅ **Push Notifications** en tiempo real
- ✅ **Permisos de notificación** con UI amigable
- ✅ **Notificaciones offline** cuando se restaura conexión
- ✅ **Banner de instalación** personalizable

### Reviews y Calificaciones
- ✅ **Sistema de reseñas** completo con estrellas (1-5)
- ✅ **Moderación automática** con blacklist de palabras prohibidas
- ✅ **Reportar reseñas** inapropiadas
- ✅ **Marcar como útil** (thumbs up/down)
- ✅ **Respuestas del vendedor** a reviews
- ✅ **Estadísticas de rating** por producto
- ✅ **Filtros** (recientes, útiles, mejor/peor calificación)

### Dashboard de Administrador
- ✅ **Panel completo de estadísticas** (usuarios, pedidos, ventas, reviews)
- ✅ **Gestión de productos** (agregar, editar, eliminar, stock)
- ✅ **Gestión de pedidos** (actualizar estado, cancelar)
- ✅ **Gestión de usuarios** (suspender, reactivar)
- ✅ **Reportes de ventas** con filtros de fecha
- ✅ **Exportación a CSV** (pedidos, usuarios, productos)
- ✅ **Moderación de reviews** (aprobar/rechazar)

### Wishlist Compartida
- ✅ **Crear múltiples listas** de deseos
- ✅ **Compartir con link único** generado automáticamente
- ✅ **Colaboradores** con permisos (view, edit, manage)
- ✅ **Compartir por WhatsApp, Email, QR**
- ✅ **Notas en productos** dentro de la wishlist
- ✅ **Estadísticas** de listas (total valor, views)
- ✅ **Importar/Exportar** listas (JSON, CSV, TXT)
- ✅ **Fusionar listas** diferentes

---

## 📁 Archivos Nuevos del Nivel 8

### Archivos Core (2,400+ líneas)
1. **service-worker.js** (280 líneas)
   - Service Worker con caché inteligente
   - Estrategias: Network First, Cache First, Stale While Revalidate
   - Manejo de notificaciones Push
   - Sincronización en background

2. **pwa-system.js** (425 líneas)
   - Registro y gestión del Service Worker
   - Sistema de instalación con prompt personalizado
   - Notificaciones Push con suscripción
   - Detectar online/offline
   - Analytics de eventos PWA

3. **review-system.js** (520 líneas)
   - CRUD completo de reviews
   - Moderación automática y manual
   - Sistema de votación (útil/no útil)
   - Reportes de reviews
   - Respuestas del vendedor
   - Estadísticas de rating

4. **admin-dashboard.js** (520 líneas)
   - Dashboard con estadísticas generales
   - Gestión de productos, pedidos, usuarios
   - Reportes y analytics
   - Exportación de datos
   - Control de acceso

5. **wishlist-share.js** (580 líneas)
   - Sistema de listas compartidas
   - Generación de links únicos
   - Colaboradores con permisos
   - Compartir por múltiples canales
   - Importar/Exportar listas
   - Fusionar listas

6. **app-v8.js** (420 líneas)
   - Integración de todos los sistemas
   - UI para reviews, admin, wishlist
   - Manejo de modales nivel 8
   - Funciones de compartir

7. **manifest.json** (85 líneas)
   - Configuración PWA
   - Iconos y screenshots
   - Shortcuts de la app
   - Share target

---

## 🎯 Cómo Usar las Nuevas Funcionalidades

### Instalar como PWA
```javascript
// La app mostrará automáticamente un banner de instalación
// O puedes llamar manualmente:
pwaSystem.installApp();
```

### Activar Notificaciones
```javascript
// Solicitar permiso de notificaciones
pwaSystem.requestNotificationPermission();

// Enviar notificación local
pwaSystem.showLocalNotification('Título', {
    body: 'Mensaje de la notificación',
    icon: '/icon-192.png'
});
```

### Sistema de Reviews
```javascript
// Inicializar sistema
const reviewSystem = new ReviewSystem();

// Enviar reseña
reviewSystem.submitReview({
    productId: 'prod_123',
    userId: 'user_456',
    userName: 'Juan Pérez',
    rating: 5,
    title: 'Excelente producto',
    comment: 'Muy buena calidad, lo recomiendo',
    verified: true
});

// Obtener reviews de un producto
const reviews = reviewSystem.getProductReviews('prod_123');

// Estadísticas de rating
const stats = reviewSystem.getProductRatingStats('prod_123');
console.log(stats.averageRating); // 4.5
console.log(stats.totalReviews); // 25
```

### Admin Dashboard
```javascript
// Inicializar (solo usuarios admin: 'admin' o 'demo')
const adminDashboard = new AdminDashboard();

// Cargar estadísticas
const stats = adminDashboard.loadStats();
console.log(stats.users.total); // Total de usuarios
console.log(stats.revenue.total); // Ingresos totales

// Actualizar producto
adminDashboard.updateProduct('prod_123', {
    stock: 50,
    price: 120000
});

// Generar reporte de ventas
const report = adminDashboard.generateSalesReport('2025-01-01', '2025-01-31');

// Exportar datos
const csv = adminDashboard.exportDataToCSV('orders');
```

### Wishlist Compartida
```javascript
// Inicializar
const wishlistShare = new WishlistShareSystem();

// Crear nueva wishlist
wishlistShare.createWishlist('Mi Lista', 'Productos que me gustan', true, 'user_123');

// Agregar producto
wishlistShare.addProductToWishlist('wl_456', {
    id: 'prod_789',
    name: 'Filtro de Aceite',
    brand: 'Auteco',
    price: 25000,
    image: '🔧'
}, 'user_123');

// Generar link para compartir
const shareResult = wishlistShare.getShareURL('wl_456');
console.log(shareResult.url); // https://...?wishlist=token123

// Compartir por WhatsApp
wishlistShare.shareWishlist('wl_456', 'whatsapp');

// Agregar colaborador
wishlistShare.addCollaborator('wl_456', 'user_999', 'edit');

// Exportar lista
const exported = wishlistShare.exportWishlist('wl_456', 'csv');
```

---

## 📊 Arquitectura PWA

### Estrategias de Caché

1. **Network First** (API y datos dinámicos)
   - Intenta obtener de la red primero
   - Si falla, usa caché
   - Actualiza caché en background

2. **Cache First** (Archivos estáticos)
   - Usa caché si está disponible
   - Solo va a la red si no hay caché
   - Ideal para CSS, JS, imágenes

3. **Stale While Revalidate** (CDN externos)
   - Retorna caché inmediatamente
   - Actualiza caché en background
   - Balance entre velocidad y frescura

### Archivos Cacheados
```javascript
// Archivos críticos siempre en caché
CRITICAL_ASSETS = [
    '/index.html',
    '/styles.css',
    '/chatbot.js',
    '/app.js',
    '/app-v6.js',
    '/app-v7.js',
    '/app-v8.js',
    // ... todos los JS del proyecto
];
```

---

## 🔒 Seguridad y Moderación

### Moderación Automática de Reviews
- Blacklist de palabras prohibidas
- Detección de URLs múltiples
- Validación de longitud mínima
- Detección de caracteres repetidos (spam)

### Control de Acceso Admin
```javascript
// Solo usuarios específicos pueden acceder
const adminUsers = ['admin', 'demo'];

// Verificación automática
if (!adminDashboard.isAdmin) {
    return { error: 'Acceso denegado' };
}
```

---

## 📈 Métricas y Analytics

### PWA Analytics
```javascript
pwaSystem.trackEvent('pwa_installed');
pwaSystem.trackEvent('notifications_enabled');
pwaSystem.trackEvent('offline');
pwaSystem.trackEvent('online');

// Obtener resumen
const analytics = pwaSystem.getAnalytics();
```

### Dashboard Analytics
- Total de usuarios (activos/inactivos)
- Total de pedidos por estado
- Ingresos (total, mes actual, mes anterior)
- Productos (stock bajo, agotados)
- Reviews (pendientes, aprobadas)
- Eventos PWA

---

## 🎨 Nuevos Componentes UI

Los estilos para estos componentes deben agregarse a `styles.css`:

### Modales Nuevos
- `#reviews-modal` - Modal de reseñas
- `#write-review-modal` - Escribir reseña
- `#admin-dashboard-modal` - Panel admin
- `#shared-wishlist-modal` - Wishlist compartida
- `#share-wishlist-modal` - Opciones de compartir

### Clases CSS Requeridas
- `.pwa-install-banner` - Banner de instalación
- `.offline-banner` - Indicador sin conexión
- `.review-card` - Tarjeta de reseña
- `.star-rating-input` - Input de estrellas
- `.admin-dashboard` - Dashboard admin
- `.stats-grid` - Grid de estadísticas
- `.wishlist-product-card` - Producto en wishlist

---

## 🔄 Migración desde v7.0

No requiere migración de datos. El nivel 8 es completamente compatible con v7.0.

Simplemente agregar:
1. Los nuevos archivos JS
2. El `manifest.json`
3. Los meta tags en `index.html`
4. Los estilos CSS para los nuevos componentes

---

## 🐛 Solución de Problemas

### Service Worker no se registra
```javascript
// Verificar soporte
if ('serviceWorker' in navigator) {
    console.log('Service Worker soportado');
} else {
    console.error('Service Worker no soportado en este navegador');
}
```

### Notificaciones no funcionan
```javascript
// Verificar permisos
if (Notification.permission === 'denied') {
    console.error('Notificaciones bloqueadas por el usuario');
}
```

### App no es instalable
- Verificar que se sirva sobre HTTPS (o localhost)
- Verificar que `manifest.json` esté correctamente configurado
- Verificar que existan los iconos referenciados

---

## 📝 Notas Técnicas

- **Compatibilidad**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Tamaño total añadido**: ~2,400 líneas de código JavaScript
- **LocalStorage usado**: `product_reviews`, `user_wishlists`, `shared_wishlists`, `pwa_events`
- **Dependencias externas**: Ninguna (100% vanilla JavaScript)

---

**Versión 8.0** - ChatBot Repuestos de Motos Colombianas
© 2025 AndroidCatt. Todos los derechos reservados.
