# ChatBot de Repuestos de Motos Colombianas

Proyecto de grado - Sistema de recomendación de repuestos para motocicletas de marcas colombianas.

## Versiones

### Nivel 1 (Básico)
- Chatbot con JavaScript vanilla
- Sin backend
- Datos estáticos

### Nivel 2 (Intermedio)
- Backend con Node.js y Express
- Base de datos SQLite
- API REST completa
- NLP básico con Natural.js
- Sistema de precios y disponibilidad
- Historial de conversaciones
- Interfaz mejorada con diseño profesional
- Búsqueda inteligente de repuestos

### Nivel 3 (Actual - E-Commerce Completo) 🚀⭐
- Todo lo del Nivel 2 +
- **Autenticación completa** (Login/Registro con JWT)
- **Carrito de compras funcional**
- **Sistema de pedidos completo**
- **Lista de favoritos**
- **Panel de administración**
- **Gestión de usuarios y roles**
- **Interfaz con modales y acciones interactivas**
- **Persistencia de sesión con localStorage**

## Características Nivel 3 🚀

### Autenticación y Usuarios
- ✅ Sistema completo de registro e inicio de sesión
- ✅ Autenticación con JWT (JSON Web Tokens)
- ✅ Roles de usuario (customer, admin)
- ✅ Persistencia de sesión con localStorage
- ✅ Perfil de usuario completo

### Carrito de Compras
- ✅ Agregar productos al carrito
- ✅ Modificar cantidades
- ✅ Eliminar productos
- ✅ Cálculo automático de totales
- ✅ Vista detallada del carrito

### Sistema de Pedidos
- ✅ Realizar pedidos desde el carrito
- ✅ Historial completo de pedidos
- ✅ Estados de pedido (pending, completed, cancelled)
- ✅ Dirección de entrega personalizada
- ✅ Tracking de pedidos por usuario

### Favoritos
- ✅ Agregar repuestos a favoritos
- ✅ Lista personalizada de favoritos
- ✅ Acceso rápido a productos favoritos

### Panel de Administración
- ✅ Gestión de repuestos (CRUD completo)
- ✅ Ver todos los pedidos
- ✅ Actualizar estado de pedidos
- ✅ Control de inventario
- ✅ Endpoints protegidos con roles

### Chatbot Mejorado
- ✅ Botones de acción en cada producto (🛒 carrito, ❤️ favoritos)
- ✅ Tarjetas de producto interactivas
- ✅ Mensajes contextuales según estado de login
- ✅ Búsqueda inteligente con NLP
- ✅ Flujo conversacional guiado

### Interfaz de Usuario
- ✅ Modales para login, carrito, pedidos, favoritos
- ✅ Animaciones suaves
- ✅ Indicadores visuales (badges, estados)
- ✅ Diseño responsive y profesional
- ✅ Mensajes de éxito/error contextuales

## Estructura del Proyecto

```
chatbot-repuestos-motos/
├── public/
│   ├── index.html         # Página principal Nivel 3
│   ├── index-v3.html      # Versión backup Nivel 3
│   ├── index-backup.html  # Versión Nivel 2
│   ├── styles-v3.css      # Estilos Nivel 3
│   ├── app-v3.js          # Cliente principal Nivel 3
│   ├── app-v3-auth.js     # Funciones de autenticación
│   └── app.js             # Cliente Nivel 2
├── scripts/
│   └── init-database.js   # Inicializador de BD
├── server-v3.js           # Servidor Nivel 3 (actual)
├── server.js              # Servidor Nivel 2
├── auth.js                # Middleware de autenticación
├── package.json           # Dependencias
├── database.db            # Base de datos SQLite (generada)
├── .gitignore
└── README.md
```

## Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Inicializar base de datos
```bash
npm run init-db
```

### 3. Iniciar servidor
```bash
npm start
```

O para desarrollo con auto-reload:
```bash
npm run dev
```

### 4. Abrir navegador
Navega a `http://localhost:3000`

## Marcas y Modelos Incluidos

### Auteco
- Discover 125
- Pulsar NS 200
- Pulsar NS 160
- Victory 100

### AKT
- NKD 125
- TTR 200
- CR5 180
- AK 125

### TVS
- Apache RTR 160
- Apache RTR 200
- Sport 100

### Boxer
- BM 150
- BM 125
- CT 100

## Tecnologías Utilizadas

### Frontend
- HTML5
- CSS3 (con variables CSS y diseño responsive)
- JavaScript (ES6+)
- Fetch API

### Backend
- Node.js
- Express.js
- SQLite3
- Natural.js (NLP)
- CORS
- Body-parser

## API Endpoints

### Marcas
- `GET /api/brands` - Obtener todas las marcas

### Modelos
- `GET /api/models/:brandId` - Obtener modelos por marca

### Categorías
- `GET /api/categories` - Obtener todas las categorías

### Repuestos
- `GET /api/parts?brandId=&categoryId=` - Obtener repuestos filtrados
- `POST /api/search` - Búsqueda de repuestos por texto

### Conversaciones
- `POST /api/conversations` - Guardar conversación
- `GET /api/conversations/:sessionId` - Obtener historial

### Chat
- `POST /api/chat` - Procesar mensaje con NLP

## Base de Datos

La base de datos incluye:
- **4 marcas** colombianas
- **15+ modelos** de motos
- **6 categorías** de repuestos
- **120+ repuestos** con precios y stock

### Categorías:
1. Motor (pistones, filtros, bujías, etc.)
2. Suspensión (amortiguadores, horquillas)
3. Frenos (pastillas, discos, bombas)
4. Sistema Eléctrico (baterías, CDI, reguladores)
5. Transmisión (cadenas, piñones, coronas)
6. Otros (llantas, filtros de aire, espejos)

## Funcionalidades del Chatbot

### Consultas Soportadas:
- **Precios**: "¿Cuánto cuesta un filtro de aceite?"
- **Disponibilidad**: "¿Hay pastillas de freno disponibles?"
- **Búsqueda**: "Busco repuestos para motor"
- **Conversacional**: Flujo guiado paso a paso

### Inteligencia:
- Detección de intenciones con NLP
- Tokenización de mensajes
- Búsqueda semántica
- Contexto de conversación

## Mejoras Futuras (Nivel 3)

- [ ] Autenticación de usuarios
- [ ] Panel de administración
- [ ] Imágenes de repuestos
- [ ] Sistema de carrito de compras
- [ ] Integración con pasarelas de pago
- [ ] Chatbot con IA generativa (GPT)
- [ ] Recomendaciones personalizadas con ML
- [ ] Notificaciones en tiempo real
- [ ] Soporte multiidioma
- [ ] App móvil nativa

## Licencia

MIT

## Guía de Uso - Nivel 3 🎯

### Credenciales por Defecto

**Usuario Administrador:**
- Username: `admin`
- Password: `admin123`
- Rol: admin

### Flujo de Uso Recomendado

1. **Primera vez:**
   - Abre http://localhost:3000
   - Haz clic en "Iniciar Sesión"
   - Crea una cuenta nueva o usa admin/admin123
   
2. **Explorar productos:**
   - Escribe "mostrar todo" en el chat
   - O usa "categorías" para ver por tipo
   - Cada producto tiene botones 🛒 y ❤️
   
3. **Agregar al carrito:**
   - Haz clic en 🛒 en cualquier producto
   - El badge del carrito se actualizará
   - Haz clic en el ícono del carrito en el header para ver
   
4. **Realizar pedido:**
   - En el carrito, haz clic en "Realizar Pedido"
   - Ingresa tu dirección de entrega
   - El pedido quedará en tu historial
   
5. **Ver pedidos:**
   - Haz clic en el ícono 📦 en el header
   - Verás todos tus pedidos con su estado
   
6. **Favoritos:**
   - Haz clic en ❤️ en cualquier producto
   - Accede a tus favoritos desde el ícono ❤️ en el header

### Comandos del Chatbot

- `hola` - Inicia flujo guiado
- `mostrar todo` - Ver catálogo completo
- `categorías` - Ver categorías disponibles
- `busco [producto]` - Buscar repuesto específico
- `¿cuánto cuesta [producto]?` - Consultar precio
- `¿hay [producto] disponible?` - Ver disponibilidad

## API Endpoints - Nivel 3

### Autenticación
```
POST /api/auth/register - Registrar nuevo usuario
POST /api/auth/login - Iniciar sesión
GET /api/auth/profile - Obtener perfil (requiere token)
```

### Carrito (requiere autenticación)
```
GET /api/cart - Obtener carrito del usuario
POST /api/cart - Agregar producto al carrito
PUT /api/cart/:id - Actualizar cantidad
DELETE /api/cart/:id - Eliminar producto del carrito
DELETE /api/cart - Vaciar carrito
```

### Pedidos (requiere autenticación)
```
POST /api/orders - Crear nuevo pedido
GET /api/orders - Obtener pedidos del usuario
GET /api/orders/:id - Obtener detalle de un pedido
```

### Favoritos (requiere autenticación)
```
GET /api/favorites - Obtener favoritos del usuario
POST /api/favorites - Agregar a favoritos
DELETE /api/favorites/:partId - Eliminar de favoritos
```

### Admin (requiere autenticación y rol admin)
```
GET /api/admin/orders - Ver todos los pedidos
PUT /api/admin/orders/:id - Actualizar estado de pedido
POST /api/admin/parts - Agregar repuesto
PUT /api/admin/parts/:id - Actualizar repuesto
DELETE /api/admin/parts/:id - Eliminar repuesto
```

### Públicos
```
GET /api/brands - Obtener marcas
GET /api/models/:brandId - Obtener modelos por marca
GET /api/categories - Obtener categorías
GET /api/parts - Obtener repuestos (filtros: brandId, categoryId)
POST /api/search - Buscar repuestos por texto
POST /api/chat - Procesar mensaje con NLP
```

