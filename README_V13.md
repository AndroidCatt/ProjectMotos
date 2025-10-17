# 📚 ChatBot Repuestos Motos - Versión 13.0

## 🚀 Nivel 13: Mensajería Avanzada, Push Notifications, Real-Time Analytics y Backup

La **Versión 13.0** introduce sistemas de comunicación avanzados, notificaciones push, analytics en tiempo real y backup automático con disaster recovery.

---

## 📋 Tabla de Contenidos

1. [Nuevas Funcionalidades](#nuevas-funcionalidades)
2. [Arquitectura v13.0](#arquitectura-v13)
3. [Sistema de Mensajería](#sistema-de-mensajería)
4. [Push Notifications](#push-notifications)
5. [Real-Time Analytics](#real-time-analytics)
6. [Backup y Recovery](#backup-y-recovery)
7. [Integración](#integración)
8. [Dashboards](#dashboards)
9. [API Reference](#api-reference)
10. [Configuración](#configuración)

---

## ✨ Nuevas Funcionalidades

### 💬 Sistema de Mensajería Avanzado
- **Conversaciones multi-usuario** (directas y grupos)
- **Threads** (responder a mensajes específicos)
- **Reacciones** con emojis
- **Mentions** (@usuario)
- **Typing indicators** (indicador de escritura)
- **Read receipts** (confirmaciones de lectura)
- **Delivered status** (estado de entrega)
- **Editar/Eliminar mensajes**
- **Búsqueda avanzada** en mensajes
- **Exportar conversaciones** (JSON/texto)

### 🔔 Push Notifications
- **Web Push API** integrado
- **Service Worker** para notificaciones en background
- **Notificaciones programadas** (scheduled)
- **Categorías** (pedidos, mensajes, promociones, reviews, sistema)
- **Quiet hours** (horario silencioso)
- **Preferencias** personalizables por categoría
- **Cola de notificaciones** (para quiet hours)
- **Notificaciones por tipo**: pedidos, mensajes, promociones, reviews
- **Estadísticas** de notificaciones

### 📊 Real-Time Analytics
- **Session tracking** automático
- **Event streaming** en tiempo real
- **Auto-tracking**: clicks, scroll, form submits, page views
- **Performance tracking**: carga de página, recursos lentos
- **User segmentation**: new, active, high-value, at-risk
- **Funnel analysis** (análisis de embudos)
- **Cohort analysis** (análisis de cohortes)
- **Real-time subscriptions** para eventos
- **Metrics**: active users, page views, bounce rate, conversion rate
- **Export**: JSON/CSV

### 💾 Backup y Disaster Recovery
- **Automated backups** cada hora (configurable)
- **Manual backups** on-demand
- **Point-in-time recovery** (restaurar a cualquier momento)
- **Backup de múltiples fuentes**: localStorage, sessionStorage, IndexedDB
- **Compression** automática
- **Retention policy**: horarios, diarios, semanales, mensuales
- **Export/Import** backups
- **Cloud sync** preparado (pendiente implementar)
- **Backup stats**: total size, avg size, count

---

## 🏗️ Arquitectura v13.0

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (v13.0)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   Messaging   │  │     Push      │  │   Analytics   │  │
│  │   Advanced    │  │ Notifications │  │   Real-Time   │  │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘  │
│          │                  │                  │            │
│          └──────────────────┴──────────────────┘            │
│                             │                               │
│                      ┌──────┴──────┐                        │
│                      │   Backup    │                        │
│                      │   System    │                        │
│                      └─────────────┘                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    STORAGE LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  localStorage  │  sessionStorage  │  IndexedDB  │  Cache   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💬 Sistema de Mensajería

### Características

#### 1. Conversaciones
```javascript
// Crear conversación
const conversation = messagingSystem.createConversation(
    ['user1', 'user2', 'user3'],
    {
        name: 'Equipo de Ventas',
        type: 'group' // 'direct' o 'group'
    }
);

// Listar conversaciones
const conversations = messagingSystem.listConversations('user1', {
    archived: false,
    pinned: true
});

// Actualizar conversación
messagingSystem.updateConversation(conversationId, {
    pinned: true,
    muted: false
});
```

#### 2. Mensajes
```javascript
// Enviar mensaje
const message = messagingSystem.sendMessage(conversationId, {
    text: 'Hola equipo! 👋',
    type: 'text', // text, image, file, video, audio, location
    attachments: []
});

// Responder a mensaje (threading)
const reply = messagingSystem.sendMessage(conversationId, {
    text: 'Respondiendo al mensaje anterior'
}, {
    replyTo: parentMessageId
});

// Editar mensaje
messagingSystem.editMessage(messageId, 'Texto editado');

// Eliminar mensaje
messagingSystem.deleteMessage(messageId, permanent = false);

// Buscar mensajes
const results = messagingSystem.searchMessages('repuestos', {
    conversationId: 'conv_123',
    limit: 50
});
```

#### 3. Reacciones
```javascript
// Agregar/quitar reacción
messagingSystem.addReaction(messageId, '👍');
messagingSystem.addReaction(messageId, '❤️');

// Ver resumen de reacciones
const summary = messagingSystem.getReactionsSummary(messageId);
// { '👍': { count: 5, users: ['user1', 'user2', ...] } }
```

#### 4. Threads
```javascript
// Obtener thread completo
const thread = messagingSystem.getThread(parentMessageId);
// { parentId, replies: [...], replyCount: 5, lastReply: {...} }
```

#### 5. Mentions
```javascript
// Mencionar usuario en mensaje
messagingSystem.sendMessage(conversationId, {
    text: '@juan revisa este pedido por favor'
});

// Ver menciones
const mentions = messagingSystem.getMentions('juan', unreadOnly = true);

// Marcar mención como leída
messagingSystem.markMentionAsRead('juan', messageId);
```

#### 6. Typing Indicators
```javascript
// Iniciar typing
messagingSystem.startTyping(conversationId);

// Detener typing (auto-stop después de 5s)
messagingSystem.stopTyping(conversationId);

// Ver quién está escribiendo
const typingUsers = messagingSystem.getTypingUsers(conversationId);
```

#### 7. Read Receipts
```javascript
// Marcar mensajes como leídos
messagingSystem.markAsRead(conversationId, [messageId1, messageId2]);

// Obtener conteo de no leídos
const unreadCount = messagingSystem.getUnreadCount(conversationId);

// Total no leídos
const totalUnread = messagingSystem.getTotalUnreadCount('user1');
```

### Eventos
```javascript
// Escuchar nuevos mensajes
messagingSystem.on('message_sent', (message) => {
    console.log('Nuevo mensaje:', message);
});

// Escuchar menciones
messagingSystem.on('user_mentioned', ({ message, mentions }) => {
    console.log('Te mencionaron:', mentions);
});

// Escuchar typing
messagingSystem.on('typing_started', ({ conversationId, userId }) => {
    console.log(`${userId} está escribiendo...`);
});
```

### Estadísticas
```javascript
const stats = messagingSystem.getStats();
// {
//   totalConversations: 10,
//   totalMessages: 150,
//   totalThreads: 25,
//   unreadMessages: 5
// }
```

---

## 🔔 Push Notifications

### Características

#### 1. Configuración Inicial
```javascript
// Solicitar permiso
const granted = await pushNotifications.requestPermission();

// Suscribirse a push notifications
const subscription = await pushNotifications.subscribe();

// Desuscribirse
await pushNotifications.unsubscribe();
```

#### 2. Enviar Notificaciones
```javascript
// Notificación simple
await pushNotifications.send('¡Nuevo mensaje!', {
    body: 'Juan te envió un mensaje',
    icon: '/icon-message.png',
    category: 'messages'
});

// Notificación con acciones
await pushNotifications.send('Pedido enviado', {
    body: 'Tu pedido #1234 está en camino',
    category: 'orders',
    actions: [
        { action: 'view', title: 'Ver pedido' },
        { action: 'track', title: 'Rastrear' }
    ]
});
```

#### 3. Notificaciones por Tipo
```javascript
// Pedido
await pushNotifications.sendOrderNotification({
    id: '1234',
    status: 'enviado'
});

// Mensaje
await pushNotifications.sendMessageNotification({
    id: 'msg_123',
    senderName: 'Juan',
    text: 'Hola!',
    conversationId: 'conv_1'
});

// Promoción
await pushNotifications.sendPromotionNotification({
    title: '50% OFF',
    description: 'Descuento en todos los repuestos',
    image: '/promo.jpg'
});

// Review
await pushNotifications.sendReviewNotification({
    userName: 'Carlos',
    rating: 5,
    productId: '123'
});
```

#### 4. Notificaciones Programadas
```javascript
// Programar notificación
const scheduled = pushNotifications.schedule(
    'Recordatorio',
    { body: 'No olvides completar tu pedido' },
    new Date(Date.now() + 3600000) // 1 hora después
);

// Cancelar programada
pushNotifications.cancelScheduled(scheduled.id);
```

#### 5. Preferencias
```javascript
pushNotifications.setPreferences({
    enabled: true,
    categories: {
        orders: true,
        messages: true,
        promotions: false,
        reviews: true,
        system: true
    },
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
    },
    sound: true,
    vibration: true
});
```

#### 6. Gestión
```javascript
// Listar notificaciones
const notifications = pushNotifications.getNotifications({
    unread: true,
    category: 'orders',
    since: new Date(Date.now() - 86400000) // último día
});

// Marcar como leída
pushNotifications.markAsRead(notificationId);

// Marcar todas como leídas
pushNotifications.markAllAsRead('messages');

// Eliminar
pushNotifications.deleteNotification(notificationId);

// Limpiar todas
pushNotifications.clearAll('promotions');
```

### Estadísticas
```javascript
const stats = pushNotifications.getStats();
// {
//   total: 100,
//   unread: 5,
//   last24h: 20,
//   last7d: 50,
//   byCategory: { orders: 30, messages: 50, ... },
//   scheduled: 3,
//   queued: 0
// }
```

---

## 📊 Real-Time Analytics

### Características

#### 1. Auto-Tracking
El sistema tracking automáticamente:
- **Page views**
- **Clicks** (todos los elementos)
- **Form submits**
- **Scroll depth** (profundidad de scroll)
- **Performance** (tiempos de carga)
- **Errors** (JavaScript errors)
- **Session** (inicio, actividad, fin)

#### 2. Tracking Manual
```javascript
// Track evento personalizado
realtimeAnalytics.track('button_clicked', {
    buttonId: 'checkout',
    page: '/cart'
});

// Track conversión
realtimeAnalytics.trackConversion('purchase', 100000, {
    orderId: '1234',
    items: 3
});

// Track producto
realtimeAnalytics.trackProduct('view', {
    id: '123',
    name: 'Filtro de aceite',
    price: 15000,
    category: 'Filtros'
});

// Track carrito
realtimeAnalytics.trackCart('add', {
    id: '123',
    quantity: 2,
    price: 15000
});

// Track checkout
realtimeAnalytics.trackCheckout(1, { method: 'credit_card' });

// Track búsqueda
realtimeAnalytics.trackSearch('filtro aceite', 10);
```

#### 3. Métricas en Tiempo Real
```javascript
// Usuarios activos ahora
const activeUsers = realtimeAnalytics.getActiveUsers();

// Page views últimos 5 min
const pageViews = realtimeAnalytics.getCurrentPageViews();

// Top pages
const topPages = realtimeAnalytics.getTopPages(10);

// Top eventos
const topEvents = realtimeAnalytics.getTopEvents(10);

// Eventos recientes
const recentEvents = realtimeAnalytics.getRecentEvents(50);

// Stream de eventos (último minuto)
const eventStream = realtimeAnalytics.getEventStream(60000);
```

#### 4. Análisis Avanzado
```javascript
// Funnel analysis
const funnel = realtimeAnalytics.analyzeFunnel([
    'page_view',
    'product_view',
    'add_to_cart',
    'checkout_step_1',
    'checkout_step_2',
    'purchase'
]);

// Cohort analysis
const cohorts = realtimeAnalytics.getCohortData('page_view', 'day');
```

#### 5. Suscripciones en Tiempo Real
```javascript
// Suscribirse a eventos
const subscriptionId = realtimeAnalytics.subscribe((eventType, data) => {
    if (data.name === 'purchase') {
        console.log('Nueva compra:', data);
    }
}, filterFunction);

// Desuscribirse
realtimeAnalytics.unsubscribe(subscriptionId);
```

#### 6. Dashboard Data
```javascript
const dashboardData = realtimeAnalytics.getDashboardData();
// {
//   overview: {
//     activeUsers: 5,
//     pageViews: 120,
//     uniqueVisitors: 50,
//     avgSessionDuration: '3m 25s',
//     bounceRate: '35.5%',
//     conversionRate: '2.8%'
//   },
//   topPages: [...],
//   topEvents: [...],
//   recentEvents: [...],
//   eventStream: [...]
// }
```

### Export
```javascript
// Export JSON
const json = realtimeAnalytics.exportData('json');

// Export CSV
const csv = realtimeAnalytics.exportData('csv');
```

---

## 💾 Backup y Recovery

### Características

#### 1. Crear Backup
```javascript
// Backup manual
const backup = await backupSystem.createBackup('manual', {
    trigger: 'user_request'
});

// Backup automático (configurado cada hora)
// Se ejecuta automáticamente según config
```

#### 2. Restaurar Backup
```javascript
// Restaurar backup
await backupSystem.restoreBackup(backupId, {
    clearExisting: true,  // Limpiar datos existentes
    restoreSession: false, // Restaurar sessionStorage
    reload: true          // Recargar página después
});
```

#### 3. Configuración
```javascript
backupSystem.updateConfig({
    autoBackup: {
        enabled: true,
        interval: 3600000, // 1 hora en ms
        maxBackups: 10,
        compressionEnabled: true
    },
    retention: {
        hourly: 24,   // Mantener 24 backups horarios
        daily: 7,     // 7 diarios
        weekly: 4,    // 4 semanales
        monthly: 12   // 12 mensuales
    },
    includedData: [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'cart',
        'wishlist',
        'orders',
        'conversations',
        'notifications'
    ]
});
```

#### 4. Gestión de Backups
```javascript
// Listar backups
const backups = backupSystem.listBackups({
    type: 'manual', // manual, auto, scheduled
    since: new Date('2024-01-01'),
    before: new Date('2024-12-31')
});

// Obtener backup
const backup = backupSystem.getBackup(backupId);

// Eliminar backup
backupSystem.deleteBackup(backupId);

// Eliminar todos
backupSystem.deleteAllBackups();
```

#### 5. Export/Import
```javascript
// Exportar backup a archivo
backupSystem.exportBackup(backupId, 'json');

// Importar backup desde archivo
const file = event.target.files[0];
const backup = await backupSystem.importBackup(file);
```

#### 6. Estadísticas
```javascript
const stats = backupSystem.getStats();
// {
//   totalBackups: 50,
//   totalSize: '125.5 MB',
//   avgSize: '2.51 MB',
//   lastBackup: '2024-01-15T10:30:00Z',
//   oldestBackup: '2024-01-01T00:00:00Z',
//   autoBackupEnabled: true,
//   backupsByType: { manual: 10, auto: 40 }
// }
```

### Eventos
```javascript
backupSystem.on('backup_created', (backup) => {
    console.log('Backup creado:', backup.id);
});

backupSystem.on('backup_restored', ({ backupId, timestamp }) => {
    console.log('Backup restaurado:', backupId);
});

backupSystem.on('backup_deleted', ({ backupId }) => {
    console.log('Backup eliminado:', backupId);
});
```

---

## 🔗 Integración

### Objeto Global
Todos los sistemas nivel 13 están disponibles en el objeto global:

```javascript
window.CHATBOT_SYSTEM = {
    // ... Niveles 1-12 ...

    // Nivel 13
    messaging: window.messagingSystem,
    pushNotifications: window.pushNotifications,
    realtimeAnalytics: window.realtimeAnalytics,
    backupSystem: window.backupSystem,

    version: '13.0',
    totalSystems: 34
};
```

### Integración con Sistemas Existentes

#### Mensajería + Notificaciones
```javascript
// Cuando llega un mensaje, enviar notificación
messagingSystem.on('message_sent', (message) => {
    if (message.senderId !== messagingSystem.currentUser) {
        pushNotifications.sendMessageNotification({
            id: message.id,
            senderName: message.senderId,
            text: message.content.text,
            conversationId: message.conversationId
        });
    }
});
```

#### Analytics + E-commerce
```javascript
// Track eventos de e-commerce
window.addEventListener('cart_item_added', (e) => {
    realtimeAnalytics.trackCart('add', e.detail);
});

window.addEventListener('order_completed', (e) => {
    realtimeAnalytics.trackConversion('purchase', e.detail.total, {
        orderId: e.detail.id,
        items: e.detail.items.length
    });
});
```

#### Backup Automático
```javascript
// Backup se ejecuta automáticamente cada hora
// También se crea backup antes de cerrar la página
window.addEventListener('beforeunload', () => {
    backupSystem.createBackup('auto', { trigger: 'page_unload' });
});
```

---

## 📊 Dashboards

### 1. Messaging Dashboard
```javascript
showMessagingDashboard();
```

Muestra:
- Total conversaciones, mensajes, threads
- Mensajes no leídos
- Conversaciones recientes
- Crear conversación de prueba

### 2. Analytics Dashboard
```javascript
showAnalyticsDashboard();
```

Muestra:
- Usuarios activos, page views, visitantes únicos
- Duración promedio, bounce rate, conversion rate
- Top pages
- Top eventos
- Exportar datos

### 3. Backup Dashboard
```javascript
showBackupDashboard();
```

Muestra:
- Total backups, tamaño total, tamaño promedio
- Estado auto backup
- Lista de backups recientes
- Acciones: restore, export, delete
- Crear backup manual

---

## 🎯 Casos de Uso

### Caso 1: Chat de Soporte
```javascript
// Cliente inicia conversación
const conv = messagingSystem.createConversation(
    ['client_123', 'support_agent'],
    { name: 'Soporte - Consulta Producto', type: 'direct' }
);

// Cliente envía mensaje
messagingSystem.sendMessage(conv.id, {
    text: '¿Tienen el filtro de aceite para Boxer CT100?'
});

// Agente responde
messagingSystem.sendMessage(conv.id, {
    text: 'Sí, tenemos en stock. @client_123 te envío el link'
});

// Notificación automática al cliente
// Analytics tracking automático
```

### Caso 2: Notificaciones de Pedido
```javascript
// Cuando el pedido cambia de estado
window.addEventListener('order_status_changed', (e) => {
    const order = e.detail;

    // Enviar notificación
    pushNotifications.sendOrderNotification(order);

    // Track analytics
    realtimeAnalytics.track('order_status_changed', {
        orderId: order.id,
        status: order.status
    });
});
```

### Caso 3: Backup antes de Operación Crítica
```javascript
async function deleteAllOrders() {
    // Crear backup antes de operación peligrosa
    await backupSystem.createBackup('manual', {
        trigger: 'before_delete_all',
        operation: 'delete_orders'
    });

    // Realizar operación
    // ...

    // Si algo sale mal, restaurar
    // await backupSystem.restoreBackup(backup.id);
}
```

---

## ⚙️ Configuración Avanzada

### Messaging System
```javascript
// Configurar usuario actual
messagingSystem.setCurrentUser('user_123');

// Limpiar storage
messagingSystem.clearStorage();
```

### Push Notifications
```javascript
// Personalizar preferencias
pushNotifications.setPreferences({
    enabled: true,
    categories: {
        orders: true,
        messages: true,
        promotions: false // Desactivar promociones
    },
    quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
    }
});
```

### Real-Time Analytics
```javascript
// Personalizar buffer size
realtimeAnalytics.bufferSize = 20000; // Mantener 20k eventos

// Tracking personalizado de errores
window.addEventListener('error', (e) => {
    realtimeAnalytics.trackError(e.error);
});
```

### Backup System
```javascript
// Configurar retention policy
backupSystem.updateConfig({
    retention: {
        hourly: 48,   // 2 días de horarios
        daily: 14,    // 2 semanas de diarios
        weekly: 8,    // 2 meses de semanales
        monthly: 24   // 2 años de mensuales
    }
});
```

---

## 📈 Estadísticas del Proyecto

### Versión 13.0
- **Total líneas de código**: ~27,000+
- **Archivos JavaScript**: 40+
- **Sistemas integrados**: 34
- **Idiomas soportados**: 4 (ES, EN, PT, FR)
- **Protocolos**: HTTP, WebSocket, GraphQL, Web Push

### Nuevos Archivos v13
- `messaging-advanced.js` (1,200 líneas)
- `push-notifications.js` (800 líneas)
- `analytics-realtime.js` (1,100 líneas)
- `backup-system.js` (850 líneas)
- `app-v13.js` (550 líneas)

---

## 🔮 Roadmap Futuro (v14+)

### Nivel 14 (Potencial)
- 🤝 **Collaboration Tools**: Whiteboard, screen sharing, co-browsing
- 📱 **Mobile App**: React Native o Flutter
- 🌐 **Multi-tenant**: SaaS para múltiples empresas
- 🔒 **Advanced Security**: 2FA, biometrics, encryption at rest

### Nivel 15 (Potencial)
- 🤖 **AI Agents**: Autonomous agents con LangChain
- 🎮 **Gamification 2.0**: Leaderboards globales, tournaments
- 📡 **IoT Integration**: Integración con dispositivos IoT
- 🌍 **Edge Computing**: CDN y edge functions

---

## 🐛 Troubleshooting

### Problema: Notificaciones no funcionan
**Solución**:
1. Verificar permisos del navegador
2. Verificar que Service Worker esté registrado
3. Verificar que estés en HTTPS (o localhost)

### Problema: Backup muy grande
**Solución**:
1. Activar compresión: `backupSystem.config.autoBackup.compressionEnabled = true`
2. Reducir datos incluidos en config
3. Reducir retention policy

### Problema: Analytics consume mucha memoria
**Solución**:
1. Reducir buffer size: `realtimeAnalytics.bufferSize = 5000`
2. Exportar y limpiar periódicamente

---

## 📞 Soporte

Para dudas o problemas:
- Ver documentación completa en `/docs`
- Revisar ejemplos en `/examples`
- Abrir issue en GitHub

---

## 🎉 ¡Versión 13.0 Completa!

El sistema ahora cuenta con:
- ✅ 13 niveles completamente integrados
- ✅ 34+ sistemas enterprise
- ✅ ~27,000 líneas de código
- ✅ Mensajería avanzada con threads y reacciones
- ✅ Push notifications con Web Push API
- ✅ Real-time analytics con event streaming
- ✅ Backup automático y disaster recovery
- ✅ PWA completo con modo offline
- ✅ AI/ML recommendations
- ✅ Blockchain payments
- ✅ Video calls con WebRTC
- ✅ Kubernetes deployment ready
- ✅ Monitoring con Prometheus metrics

**¡El sistema de e-commerce más completo y avanzado! 🚀**

---

*Última actualización: Versión 13.0 - 2025*
