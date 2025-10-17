# 🗄️ Guía de Acceso a Bases de Datos

**Documentación completa para acceder y modificar las bases de datos del proyecto**

## 📋 Índice
1. [SQLite Database (Backend)](#sqlite-database)
2. [LocalStorage (Frontend)](#localstorage-frontend)
3. [Redis Cache](#redis-cache)
4. [Elasticsearch Index](#elasticsearch-index)
5. [Herramientas Recomendadas](#herramientas)
6. [Ejemplos Comunes](#ejemplos-comunes)

---

## 1. SQLite Database (Backend)

### Ubicación
```
/home/jhon/chatbot-repuestos-motos/database.db
```

### Cómo Acceder

#### Opción 1: Desde el servidor API (Recomendado)
El servidor API (`server-api.js`) ya tiene acceso configurado:

```javascript
// El servidor crea/accede a la DB automáticamente al iniciar
node server-api.js

// La DB se crea en: ./database.db
```

#### Opción 2: Usando SQLite3 CLI
```bash
# Instalar sqlite3 (si no está instalado)
sudo apt-get install sqlite3  # Linux
brew install sqlite3          # macOS

# Abrir la base de datos
sqlite3 database.db

# Comandos útiles en la CLI
.tables                # Listar todas las tablas
.schema nombre_tabla   # Ver estructura de tabla
.mode column           # Formato de columnas
.headers on            # Mostrar headers
.quit                  # Salir
```

#### Opción 3: GUI - DB Browser for SQLite
```bash
# Descargar desde: https://sqlitebrowser.org/
# Abrir database.db con la aplicación
```

### Schema de la Base de Datos

#### Tabla: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    is_active INTEGER DEFAULT 1,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: products
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: orders
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    shipping REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    shipping_method TEXT,
    shipping_address TEXT,
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Tabla: reviews
```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    helpful_count INTEGER DEFAULT 0,
    verified_purchase INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### Tabla: notifications
```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Consultas SQL Comunes

#### Usuarios
```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Buscar usuario por username
SELECT * FROM users WHERE username = 'demo';

-- Actualizar email de usuario
UPDATE users
SET email = 'nuevo@email.com', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Crear nuevo usuario (password debe estar hasheado con bcrypt)
INSERT INTO users (username, email, password, full_name, role)
VALUES ('nuevo_usuario', 'email@test.com', 'hash_password', 'Juan Pérez', 'user');

-- Eliminar usuario
DELETE FROM users WHERE id = 5;

-- Contar usuarios por rol
SELECT role, COUNT(*) as total FROM users GROUP BY role;
```

#### Productos
```sql
-- Ver todos los productos
SELECT * FROM products;

-- Productos por categoría
SELECT * FROM products WHERE category = 'Aceites';

-- Productos con stock bajo
SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC;

-- Buscar productos por nombre
SELECT * FROM products WHERE name LIKE '%filtro%';

-- Actualizar precio
UPDATE products
SET price = 55000, updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Actualizar stock
UPDATE products
SET stock = stock - 2
WHERE id = 1;

-- Agregar nuevo producto
INSERT INTO products (name, description, price, brand, category, stock, sku)
VALUES ('Filtro de Aceite Premium', 'Filtro de alta calidad', 45000, 'Honda', 'Aceites', 50, 'FLT-001');

-- Productos más vendidos (requiere join con orders)
SELECT p.name, COUNT(*) as ventas
FROM products p
JOIN orders o ON JSON_EXTRACT(o.items, '$[*].productId') LIKE '%' || p.id || '%'
GROUP BY p.id
ORDER BY ventas DESC
LIMIT 10;
```

#### Pedidos
```sql
-- Ver todos los pedidos
SELECT * FROM orders ORDER BY created_at DESC;

-- Pedidos de un usuario
SELECT * FROM orders WHERE user_id = 1;

-- Pedidos por estado
SELECT * FROM orders WHERE status = 'pending';

-- Total de ventas
SELECT SUM(total) as total_ventas FROM orders WHERE status = 'completed';

-- Actualizar estado de pedido
UPDATE orders
SET status = 'shipped', tracking_number = 'TRK123456', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Pedidos del último mes
SELECT * FROM orders
WHERE created_at >= datetime('now', '-1 month')
ORDER BY created_at DESC;

-- Resumen de ventas por día
SELECT DATE(created_at) as fecha, COUNT(*) as pedidos, SUM(total) as ventas
FROM orders
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

#### Reviews
```sql
-- Ver todas las reviews
SELECT * FROM reviews;

-- Reviews de un producto
SELECT r.*, u.username
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE r.product_id = 1;

-- Rating promedio por producto
SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as total_reviews
FROM reviews
GROUP BY product_id;

-- Reviews pendientes de moderación
SELECT * FROM reviews WHERE status = 'pending';

-- Aprobar review
UPDATE reviews
SET status = 'approved'
WHERE id = 1;
```

### Backup y Restore

#### Crear Backup
```bash
# Backup completo
sqlite3 database.db ".backup backup_$(date +%Y%m%d).db"

# O usando cp
cp database.db database_backup_$(date +%Y%m%d).db

# Exportar a SQL
sqlite3 database.db .dump > backup.sql
```

#### Restaurar Backup
```bash
# Desde archivo .db
cp backup_20250117.db database.db

# Desde archivo .sql
sqlite3 database.db < backup.sql
```

---

## 2. LocalStorage (Frontend)

### Ubicación
LocalStorage del navegador (Chrome DevTools > Application > Local Storage)

### Estructura de Datos

#### Productos Personalizados
```javascript
// Key: bot_custom_products
localStorage.getItem('bot_custom_products');

// Formato:
[
    {
        id: 'custom_1',
        name: 'Producto Custom',
        price: 50000,
        brand: 'Marca',
        category: 'Categoria',
        stock: 10
    }
]
```

#### Usuario Autenticado
```javascript
// Key: currentUser
localStorage.getItem('currentUser');

// Formato:
{
    id: '123',
    username: 'usuario',
    email: 'email@test.com',
    fullName: 'Juan Pérez',
    role: 'user'
}

// Key: auth_token
localStorage.getItem('auth_token'); // JWT token
```

#### Carrito de Compras
```javascript
// Key: cart
localStorage.getItem('cart');

// Formato:
{
    items: [
        {
            id: '1',
            name: 'Producto',
            price: 50000,
            quantity: 2
        }
    ],
    total: 100000
}
```

#### Pedidos
```javascript
// Key: orders
localStorage.getItem('orders');

// Formato: Array de pedidos
```

#### Favoritos
```javascript
// Key: favorites
localStorage.getItem('favorites');

// Formato: Array de IDs de productos
```

#### Estadísticas de Usuario
```javascript
// Key: userStats
localStorage.getItem('userStats');

// Formato:
{
    level: 1,
    points: 100,
    achievements: ['first_purchase', 'product_review'],
    interactionCount: 25
}
```

### Cómo Acceder

#### Desde DevTools Console
```javascript
// Ver todas las keys
Object.keys(localStorage);

// Obtener valor
const cart = JSON.parse(localStorage.getItem('cart'));
console.log(cart);

// Modificar valor
const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
cart.items.push({ id: '99', name: 'Nuevo Producto', price: 50000, quantity: 1 });
localStorage.setItem('cart', JSON.stringify(cart));

// Eliminar key
localStorage.removeItem('cart');

// Limpiar todo
localStorage.clear();
```

#### Desde Código JavaScript
```javascript
// Obtener carrito
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], total: 0 };
}

// Actualizar carrito
function updateCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Agregar al carrito
function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.items.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.items.push({ ...product, quantity: 1 });
    }

    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateCart(cart);
}
```

### Exportar/Importar LocalStorage
```javascript
// Exportar todo localStorage
const backup = {};
for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
        backup[key] = localStorage.getItem(key);
    }
}
console.log(JSON.stringify(backup, null, 2));
// Copiar y guardar en archivo

// Importar desde backup
const backup = { /* objeto exportado */ };
Object.keys(backup).forEach(key => {
    localStorage.setItem(key, backup[key]);
});
```

---

## 3. Redis Cache

### Ubicación
Simulado en `localStorage` con key: `redis_cache`

### Cómo Acceder

#### Desde DevTools Console
```javascript
// Ver todo el cache
const cache = JSON.parse(localStorage.getItem('redis_cache') || '{}');
console.log(cache);

// Ver stats
window.redisCache.info();

// Ver todas las keys
window.redisCache.keys('*');

// Obtener valor
window.redisCache.get('product:123');

// Establecer valor (TTL en segundos)
window.redisCache.set('product:123', productData, 3600);

// Eliminar
window.redisCache.del('product:123');

// Limpiar todo
window.redisCache.flushdb();
```

#### Operaciones Comunes
```javascript
// Cache de productos
window.redisCache.set('product:1', {
    id: 1,
    name: 'Filtro de Aceite',
    price: 45000
}, 3600); // 1 hora

// Cache de búsquedas
window.redisCache.set('search:filtro', searchResults, 1800); // 30 min

// Hash para carrito
window.redisCache.hset('cart:user123', 'product1', 2);
window.redisCache.hget('cart:user123', 'product1'); // 2

// Invalidar pattern
window.redisCache.invalidatePattern('product:*');
```

---

## 4. Elasticsearch Index

### Ubicación
Simulado en memoria en `window.elasticsearch.indices`

### Cómo Acceder

#### Desde DevTools Console
```javascript
// Ver todos los índices
console.log(window.elasticsearch.indices);

// Ver índice de productos
console.log(window.elasticsearch.indices['products']);

// Buscar
const results = window.elasticsearch.search('products', {
    query: {
        match: { name: 'filtro' }
    }
});
console.log(results);

// Indexar documento
window.elasticsearch.index('products', '123', {
    name: 'Filtro de Aceite',
    brand: 'Honda',
    price: 45000,
    category: 'Aceites'
});

// Eliminar documento
window.elasticsearch.delete('products', '123');

// Re-indexar todos los productos
indexProductsInElasticsearch();
```

#### Búsquedas Avanzadas
```javascript
// Búsqueda con filtros
window.elasticsearch.search('products', {
    query: {
        bool: {
            must: [
                { match: { name: 'filtro' } }
            ],
            filter: [
                { range: { price: { gte: 30000, lte: 100000 } } },
                { term: { category: 'Aceites' } }
            ]
        }
    },
    aggs: {
        brands: {
            terms: { field: 'brand' }
        }
    }
});

// Fuzzy search
window.elasticsearch.search('products', {
    query: {
        fuzzy: {
            name: { value: 'filtr', fuzziness: 2 }
        }
    }
});
```

---

## 5. Herramientas Recomendadas

### Para SQLite
1. **DB Browser for SQLite** (GUI)
   - Descargar: https://sqlitebrowser.org/
   - Fácil de usar, visualización de datos

2. **SQLite CLI** (Terminal)
   - Instalación: `apt-get install sqlite3` o `brew install sqlite3`
   - Poderoso para scripts

3. **VS Code Extensions**
   - SQLite Viewer
   - SQLite Explorer

### Para LocalStorage
1. **Chrome DevTools**
   - Application > Local Storage
   - Permite ver/editar en tiempo real

2. **Storage Manager Extension**
   - Chrome extension para export/import

### Para Debugging
1. **Chrome DevTools Console**
   - Acceso directo a todos los sistemas
   - `window.redisCache`, `window.elasticsearch`, etc.

2. **Network Tab**
   - Monitorear requests al backend API

3. **WebSocket Tab**
   - Ver mensajes WebSocket en tiempo real

---

## 6. Ejemplos Comunes

### Resetear Usuario Demo
```javascript
// En la consola del navegador
const users = JSON.parse(localStorage.getItem('users') || '[]');
const demo = users.find(u => u.username === 'demo');
if (demo) {
    demo.password = '$2a$10$...'; // Hash bcrypt de 'demo123'
    localStorage.setItem('users', JSON.stringify(users));
}
```

### Cambiar Precio de Todos los Productos
```sql
-- En SQLite
UPDATE products
SET price = price * 1.10, updated_at = CURRENT_TIMESTAMP;
```

### Limpiar Carritos Abandonados
```javascript
// En la consola
window.redisCache.keys('cart:*').forEach(key => {
    const ttl = window.redisCache.ttl(key);
    if (ttl === -2 || ttl < 3600) { // Menos de 1 hora
        window.redisCache.del(key);
    }
});
```

### Migrar Datos de LocalStorage a SQLite
```javascript
// Obtener pedidos de localStorage
const orders = JSON.parse(localStorage.getItem('orders') || '[]');

// Enviar al backend
orders.forEach(async (order) => {
    await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
        },
        body: JSON.stringify(order)
    });
});
```

### Ver Logs de Analytics
```javascript
// En la consola
const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');

// Filtrar eventos de hoy
const today = new Date().toISOString().split('T')[0];
const todayEvents = events.filter(e => e.timestamp.startsWith(today));

console.log('Eventos de hoy:', todayEvents.length);
console.log('Por tipo:',
    todayEvents.reduce((acc, e) => {
        acc[e.name] = (acc[e.name] || 0) + 1;
        return acc;
    }, {})
);
```

### Backup Completo del Sistema
```bash
#!/bin/bash
# Crear directorio de backup
mkdir -p backup_$(date +%Y%m%d)

# Backup SQLite
sqlite3 database.db ".backup backup_$(date +%Y%m%d)/database.db"

# Nota: LocalStorage debe exportarse manualmente desde DevTools
# o usando el código JavaScript de export
```

---

## 🔐 Notas de Seguridad

1. **Passwords**: Siempre usar bcrypt para hashear passwords
   ```javascript
   const bcrypt = require('bcrypt');
   const hash = await bcrypt.hash('password', 10);
   ```

2. **JWT Tokens**: No exponer secrets en frontend
   ```javascript
   // El secret debe estar solo en backend (server-api.js)
   const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-super-seguro';
   ```

3. **SQL Injection**: Usar prepared statements
   ```javascript
   // Correcto
   db.get('SELECT * FROM users WHERE id = ?', [userId], callback);

   // Incorrecto
   db.get(`SELECT * FROM users WHERE id = ${userId}`, callback);
   ```

4. **Backups**: Hacer backups regulares de la base de datos

---

## 📞 Soporte

Si necesitas ayuda adicional:
1. Revisa los comentarios en el código fuente
2. Consulta la documentación de SQLite: https://www.sqlite.org/docs.html
3. Revisa los ejemplos en los archivos `*-system.js`

---

**Guía de Bases de Datos v1.0** - Documentación completa de acceso a datos

🚀 Generated with Claude Code - https://claude.com/claude-code
