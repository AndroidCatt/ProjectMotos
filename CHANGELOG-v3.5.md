# ChatBot Repuestos Motos - Changelog v3.5

## 🎉 Versión 3.5 - Mejoras Significativas

### ✨ Nuevas Funcionalidades

#### 1. 📸 Sistema de Imágenes de Productos
- **Imágenes en tarjetas de productos**: Cada repuesto ahora muestra una imagen
- **Placeholder automático**: Imágenes por defecto según categoría
- **Tabla `part_images`**: Sistema extensible para múltiples imágenes por producto
- **Campo `image_url`** en tabla `parts` para acceso rápido

#### 2. ⭐ Sistema de Calificaciones y Opiniones
- **Calificaciones de 1 a 5 estrellas**: Los usuarios pueden calificar productos
- **Comentarios opcionales**: Agregar opiniones detalladas
- **Promedio de calificaciones**: Se muestra en cada producto
- **Contador de opiniones**: Cantidad de reviews por producto
- **Tabla `reviews`**: Almacena todas las calificaciones
- **Validación**: Un usuario solo puede dejar una opinión por producto
- **Modal interactivo**: Ver todas las opiniones y agregar la propia

#### 3. 🔍 Búsqueda Avanzada con Filtros
- **Panel de filtros completo**:
  - Búsqueda por texto
  - Filtro por marca (Auteco, AKT, TVS, Boxer)
  - Filtro por categoría
  - Rango de precios (mínimo y máximo)
  - Calificación mínima
  - Solo productos disponibles
  - Ordenamiento múltiple (nombre, precio, calificación, stock)
- **Endpoint `/api/search/advanced`**: Búsqueda optimizada en backend
- **Activar con**: Escribe "filtros" o "búsqueda avanzada" en el chat

#### 4. 📊 Dashboard de Administración
- **Solo para usuarios admin** (usuario: admin, contraseña: admin123)
- **Estadísticas principales**:
  - Total de usuarios registrados
  - Total de pedidos
  - Ingresos totales
  - Productos totales en inventario
- **Productos más vendidos**: Top 10 con cantidad vendida
- **Alertas de stock bajo**: Productos con menos de 10 unidades
- **Últimas opiniones**: Reviews recientes de clientes
- **Estados de pedidos**: Distribución por estado
- **Endpoint `/api/admin/dashboard`**: Datos consolidados
- **Acceso**: Botón "📊 Dashboard" en el header (solo visible para admin)

#### 5. 🎨 Mejoras de UI/UX
- **Animaciones suaves**: Efectos de entrada con `fadeIn` y `slideIn`
- **Tarjetas mejoradas**: Diseño con imágenes, calificaciones y badges
- **Gradientes modernos**: Tarjetas de estadísticas con gradientes coloridos
- **Badges por marca**: Colores distintivos para cada marca de moto
- **Stock visual**: Color rojo si stock < 10, verde si >= 10
- **Tooltips**: Información adicional al pasar el mouse
- **Loading skeletons**: Placeholders durante carga
- **Responsive mejorado**: Mejor adaptación a dispositivos móviles

#### 6. 💾 Sistema de Historial de Conversaciones
- **Tabla `conversation_history`**: Almacena todo el historial
- **Campos adicionales**: intent, context, user_id
- **Endpoint `/api/conversations`**: Guardar conversaciones
- **Endpoint `/api/conversations/history`**: Recuperar historial
- **Base para futuras mejoras**: Análisis de comportamiento y recomendaciones

### 🔧 Mejoras Técnicas

#### Backend (server-v3.js)
- **Nuevos endpoints**:
  - `GET /api/reviews/:partId` - Obtener reviews de un producto
  - `POST /api/reviews` - Agregar review (requiere autenticación)
  - `GET /api/reviews/:partId/user` - Review del usuario actual
  - `GET /api/search/advanced` - Búsqueda con filtros múltiples
  - `POST /api/conversations` - Guardar conversación
  - `GET /api/conversations/history` - Obtener historial
  - `GET /api/admin/dashboard` - Dashboard administrativo
  - `GET /api/admin/sales-stats` - Estadísticas de ventas por periodo

#### Base de Datos (upgrade-to-v3.5.js)
- **Nuevas tablas**:
  - `part_images`: Imágenes de productos
  - `reviews`: Calificaciones y opiniones
  - `conversation_history`: Historial de conversaciones mejorado
  - `statistics`: Métricas del sistema
- **Nuevas columnas en `parts`**:
  - `image_url`: URL de la imagen principal
  - `rating_average`: Promedio de calificaciones
  - `review_count`: Cantidad de opiniones
  - `views`: Contador de vistas (para futuras implementaciones)

#### Frontend (app-v3-fixed.js)
- **Funciones nuevas**:
  - `createStars(rating)`: Genera estrellas visuales
  - `showReviews(partId)`: Modal de opiniones
  - `selectRating(rating)`: Selector de calificación
  - `submitReview()`: Enviar opinión
  - `showAdvancedSearch()`: Panel de filtros
  - `applyFilters()`: Aplicar búsqueda con filtros
  - `showAdminDashboard()`: Dashboard administrativo
- **Mejora de `createPartCardV3`**: Incluye imágenes, calificaciones y nuevo diseño

#### Estilos (styles-v3.css)
- **Nuevos estilos**:
  - `.rating-stars`: Sistema de calificación visual
  - `.part-card-with-image`: Tarjetas con imágenes
  - `.filters-panel`: Panel de filtros avanzados
  - `.dashboard-grid`: Grid de estadísticas
  - `.stat-card`: Tarjetas de estadísticas con gradientes
  - `.review-item`: Tarjetas de opiniones
  - Animaciones: `@keyframes fadeIn`, `slideIn`, `pulse`
  - Skeletons de carga
  - Tooltips
  - Badges mejorados

### 📝 Comandos del ChatBot

Nuevos comandos disponibles:
- **"filtros"** o **"búsqueda avanzada"**: Abre el panel de filtros
- **"mostrar todo"**: Catálogo con imágenes y calificaciones
- **"categorías"**: Ver categorías con marcas disponibles

### 🚀 Instalación y Actualización

#### Si es la primera vez:
```bash
npm install
npm run init-db
npm start
```

#### Si tienes la base de datos de v3.0:
```bash
npm run upgrade-v3.5
npm start
```

### 👤 Usuarios de Prueba

**Usuario Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`
- Acceso al dashboard administrativo

**Para crear usuario normal:**
- Clic en "Iniciar Sesión" → "Regístrate"
- Completa el formulario
- Podrás calificar productos y comprar

### 🎯 Próximas Mejoras Potenciales (v4.0)

1. **Sistema de pagos**: Integración con PSE o Mercado Pago
2. **Notificaciones**: Email o SMS al realizar pedidos
3. **Chat en vivo**: Soporte en tiempo real
4. **Comparador**: Comparar hasta 3 productos lado a lado
5. **Recomendaciones AI**: Basadas en compras previas y reviews
6. **Carga de imágenes**: Permitir al admin subir imágenes reales
7. **Seguimiento de pedidos**: Tracking con estados detallados
8. **Programa de fidelidad**: Puntos por compras
9. **Descuentos y cupones**: Sistema promocional
10. **Multi-idioma**: Inglés y español

### 📊 Métricas del Proyecto

- **Líneas de código JavaScript**: ~1,300+
- **Líneas de código CSS**: ~1,360+
- **Endpoints API**: 40+
- **Tablas en base de datos**: 13
- **Productos en catálogo**: 120+ (30 por marca)
- **Categorías**: 6
- **Marcas de motos**: 4 (Auteco, AKT, TVS, Boxer)

### 🐛 Correcciones de Bugs

- ✅ Corregido: Chatbot no respondía en v3.0
- ✅ Corregido: Categorías no mostraban marcas
- ✅ Corregido: API de GPT sin créditos causaba errores
- ✅ Mejorado: Búsqueda más inteligente y precisa
- ✅ Mejorado: Manejo de errores en autenticación

### 💡 Tips de Uso

1. **Calificaciones**: Solo usuarios autenticados pueden dejar opiniones
2. **Dashboard**: Solo el usuario admin ve el botón "📊 Dashboard"
3. **Filtros**: Los filtros son acumulativos, puedes combinar varios
4. **GPT**: Agrega créditos en OpenAI para activar respuestas con IA
5. **Imágenes**: Las imágenes actuales son placeholders, próximamente reales

---

**Desarrollado para proyecto de grado universitario**
**Versión**: 3.5.0
**Fecha**: 2025
**Tecnologías**: Node.js, Express, SQLite, Vanilla JavaScript, OpenAI API
