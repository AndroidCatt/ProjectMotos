# 🗄️ Guía Completa de Acceso a Bases de Datos

## 📋 Índice

- [Introducción](#introducción)
- [Método 1: Panel de Administración v14 (Más Fácil)](#método-1-panel-de-administración-v14-más-fácil)
- [Método 2: DB Browser for SQLite (Recomendado)](#método-2-db-browser-for-sqlite-recomendado)
- [Método 3: Línea de Comandos](#método-3-línea-de-comandos)
- [Método 4: VS Code Extension](#método-4-vs-code-extension)
- [Método 5: Node.js Script](#método-5-nodejs-script)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Operaciones Comunes](#operaciones-comunes)
- [Entrenamiento del Bot](#entrenamiento-del-bot)
- [Backup y Restore](#backup-y-restore)

---

## 🎯 Introducción

Este proyecto utiliza **SQLite** como base de datos. El archivo de la BD se llama `database.sqlite` y está ubicado en la raíz del proyecto:

```
/home/jhon/chatbot-repuestos-motos/database.sqlite
```

Hay **5 métodos** para acceder y gestionar la base de datos. El más fácil es el **Panel de Administración v14**.

---

## 🔧 Método 1: Panel de Administración v14 (Más Fácil)

### ✨ Ventajas
- ✅ **Interfaz visual intuitiva** - No necesitas SQL
- ✅ **CRUD completo** - Crear, Leer, Actualizar, Eliminar
- ✅ **Entrenar el bot** - Interfaz dedicada
- ✅ **Backup/Restore** - Exporta e importa con un click
- ✅ **Sin instalación** - Todo en el navegador

### 📖 Cómo Acceder

#### Paso 1: Iniciar el Servidor

```bash
cd /home/jhon/chatbot-repuestos-motos
npm start
```

#### Paso 2: Abrir la Aplicación

Abre tu navegador en: **http://localhost:3000**

#### Paso 3: Abrir el Panel de Admin

Hay 3 formas:

**Opción A: Botón en el Header**
- Busca el botón **🔧** en la esquina superior derecha
- Click en el botón

**Opción B: Atajo de Teclado**
- Presiona: **Ctrl + Shift + A** (Windows/Linux)
- O: **Cmd + Shift + A** (Mac)

**Opción C: Consola de JavaScript**
- Presiona **F12** para abrir la consola
- Escribe: `v14.openAdmin()`
- Presiona **Enter**

### 🗄️ Gestión de Base de Datos

Una vez en el panel:

1. **Click en "🗄️ Base de Datos"** en el menú lateral

2. **Ver Tablas Disponibles:**
   - `products` - Productos del catálogo
   - `users` - Usuarios del sistema
   - `orders` - Pedidos realizados
   - `bot_training` - Entrenamientos del bot

3. **Ver Contenido de una Tabla:**
   - Click en una tarjeta de tabla
   - Se abrirá el visor de tabla con todos los registros

4. **Operaciones:**
   - **Agregar**: Click en "➕ Agregar"
   - **Editar**: Click en el botón ✏️ del registro
   - **Eliminar**: Click en el botón 🗑️ del registro
   - **Exportar**: Click en "📤 Exportar"

### 🤖 Entrenar el Bot

1. **Click en "🤖 Entrenar Bot"** en el menú lateral

2. **Agregar Nuevo Entrenamiento:**
   - **Patrón**: Regex para detectar mensajes (ej: `(hola|hi|hey)`)
   - **Categoría**: Tipo de entrenamiento (Saludo, Producto, etc.)
   - **Respuesta**: Lo que el bot responderá
   - **Ejemplos**: Ejemplos de mensajes de usuario

3. **Probar el Bot:**
   - Click en "🧪 Probar Bot"
   - Ingresa un mensaje de prueba
   - Ve la respuesta del bot

4. **Gestionar Entrenamientos:**
   - **Filtrar**: Por categoría o búsqueda
   - **Editar**: Click en ✏️
   - **Eliminar**: Click en 🗑️
   - **Exportar**: Click en "📤 Exportar Entrenamientos"

### 💾 Backup y Restore

1. **Click en "💾 Backup/Restore"** en el menú lateral

2. **Exportar Datos:**
   - **📄 Exportar JSON**: Formato completo
   - **🗄️ Exportar SQL**: Script SQL
   - **📊 Exportar CSV**: Compatible con Excel

3. **Importar Datos:**
   - Click en "📂 Seleccionar Archivo"
   - Elige un archivo JSON, SQL o CSV
   - Los datos se importarán automáticamente

### ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| **Ctrl+Shift+A** | Abrir Panel de Admin |
| **Ctrl+Shift+D** | Ir a Dashboard |
| **Ctrl+Shift+T** | Ir a Entrenamiento del Bot |
| **Ctrl+Shift+B** | Crear Backup Rápido |

---

## 🖥️ Método 2: DB Browser for SQLite (Recomendado)

### ✨ Ventajas
- ✅ **Interfaz gráfica profesional**
- ✅ **Editor SQL completo**
- ✅ **Visualización de esquemas**
- ✅ **Importar/Exportar en múltiples formatos**
- ✅ **Gratis y open source**

### 📥 Instalación

#### En Windows/Mac:

1. Visita: https://sqlitebrowser.org/
2. Descarga la versión para tu sistema operativo
3. Instala el programa (Next, Next, Finish)

#### En Linux (Ubuntu/Debian):

```bash
sudo apt update
sudo apt install sqlitebrowser
```

#### En Linux (Fedora):

```bash
sudo dnf install sqlitebrowser
```

### 📖 Cómo Usar

#### 1. Abrir la Base de Datos

**Opción A: Desde la Aplicación**
1. Abre DB Browser for SQLite
2. Menú **File** → **Open Database**
3. Navega a: `/home/jhon/chatbot-repuestos-motos/database.sqlite`
4. Click en **Abrir**

**Opción B: Desde la Terminal**

```bash
cd /home/jhon/chatbot-repuestos-motos
sqlitebrowser database.sqlite
```

**Opción C: Click Derecho (Windows/Mac)**
- Click derecho en `database.sqlite`
- "Abrir con" → "DB Browser for SQLite"

#### 2. Explorar Datos

**Pestaña "Browse Data":**
- Selecciona una tabla del dropdown
- Ve todos los registros
- Edita haciendo doble click en una celda
- Agrega/elimina registros con los botones

**Pestaña "Execute SQL":**
- Escribe consultas SQL
- Ejecuta con Ctrl+Enter
- Ve los resultados abajo

**Pestaña "Database Structure":**
- Ve el esquema de todas las tablas
- Ve índices y triggers

#### 3. Operaciones Comunes

**Ver Todos los Productos:**

1. Ve a "Execute SQL"
2. Escribe:
   ```sql
   SELECT * FROM products;
   ```
3. Click en el botón ▶️ (Execute)

**Agregar un Producto:**

```sql
INSERT INTO products (name, price, brand, category, description, image)
VALUES ('Llanta Trasera', 150000, 'Yamaha', 'Llantas', 'Llanta trasera original', 'yamaha-llanta.jpg');
```

**Actualizar Precio:**

```sql
UPDATE products SET price = 140000 WHERE id = 1;
```

**Eliminar un Registro:**

```sql
DELETE FROM products WHERE id = 1;
```

#### 4. Exportar Datos

1. Menú **File** → **Export** → **Table(s) as CSV file**
2. Selecciona la tabla
3. Elige ubicación
4. Click en **Save**

#### 5. Importar Datos

1. Menú **File** → **Import** → **Table from CSV file**
2. Selecciona el archivo CSV
3. Configura opciones (separador, columnas, etc.)
4. Click en **Import**

---

## 💻 Método 3: Línea de Comandos

### ✨ Ventajas
- ✅ **Rápido para operaciones simples**
- ✅ **Automatizable con scripts**
- ✅ **No requiere interfaz gráfica**

### 📖 Cómo Usar

#### 1. Abrir la Base de Datos

```bash
cd /home/jhon/chatbot-repuestos-motos
sqlite3 database.sqlite
```

Verás el prompt: `sqlite>`

#### 2. Comandos Básicos

**Ver todas las tablas:**

```sql
.tables
```

**Ver esquema de una tabla:**

```sql
.schema products
```

**Ver todos los productos:**

```sql
SELECT * FROM products;
```

**Ver con formato bonito:**

```sql
.mode column
.headers on
SELECT * FROM products;
```

**Ver solo algunas columnas:**

```sql
SELECT id, name, price, brand FROM products;
```

**Buscar productos de una marca:**

```sql
SELECT * FROM products WHERE brand = 'Yamaha';
```

**Contar productos:**

```sql
SELECT COUNT(*) FROM products;
```

**Productos más caros:**

```sql
SELECT * FROM products ORDER BY price DESC LIMIT 5;
```

#### 3. Insertar Datos

```sql
INSERT INTO products (name, price, brand, category, description, image)
VALUES ('Batería YTX9-BS', 180000, 'Yamaha', 'Baterías', 'Batería de gel 12V', 'bateria.jpg');
```

#### 4. Actualizar Datos

```sql
UPDATE products SET price = 175000 WHERE name = 'Batería YTX9-BS';
```

#### 5. Eliminar Datos

```sql
DELETE FROM products WHERE id = 10;
```

#### 6. Exportar a CSV

```sql
.mode csv
.output products.csv
SELECT * FROM products;
.output stdout
```

#### 7. Salir

```sql
.quit
```

O presiona **Ctrl+D**

### 🔧 Comandos Útiles de SQLite

```sql
.help              -- Ver todos los comandos
.tables            -- Listar tablas
.schema TABLE      -- Ver estructura de tabla
.mode column       -- Formato columnar
.mode csv          -- Formato CSV
.headers on        -- Mostrar encabezados
.output FILE       -- Guardar output a archivo
.read FILE.sql     -- Ejecutar script SQL
.dump              -- Exportar toda la BD
.quit              -- Salir
```

---

## 📝 Método 4: VS Code Extension

### ✨ Ventajas
- ✅ **Integrado en tu editor**
- ✅ **No necesitas abrir otra app**
- ✅ **Visualización rápida**

### 📥 Instalación

1. Abre **VS Code**
2. Click en el ícono de Extensiones (Ctrl+Shift+X)
3. Busca: **"SQLite Viewer"** o **"SQLite"**
4. Instala la extensión de **alexcvzz**

### 📖 Cómo Usar

#### 1. Abrir Base de Datos

**Opción A:**
1. En el explorador de archivos de VS Code
2. Click derecho en `database.sqlite`
3. Selecciona "Open Database"

**Opción B:**
1. Presiona **Ctrl+Shift+P**
2. Escribe: "SQLite: Open Database"
3. Selecciona `database.sqlite`

#### 2. Explorar Datos

1. Se abrirá un panel "SQLite Explorer"
2. Expande las tablas
3. Click en una tabla para ver sus datos
4. Click derecho en una tabla → "Show Table" para vista completa

#### 3. Ejecutar Queries

1. Crea un archivo nuevo (ej: `query.sql`)
2. Escribe tu consulta SQL
3. Click derecho → "Run Query"
4. Ve los resultados en un panel lateral

---

## 🔧 Método 5: Node.js Script

### ✨ Ventajas
- ✅ **Automatizable**
- ✅ **Integrado con el proyecto**
- ✅ **Puedes usar JavaScript**

### 📖 Cómo Usar

#### 1. Crear Script

Crea un archivo `db-access.js`:

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Ver todos los productos
db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('📦 Productos:');
    rows.forEach(row => {
        console.log(`${row.id}: ${row.name} - $${row.price} (${row.brand})`);
    });
});

// Agregar producto
const insertProduct = db.prepare(`
    INSERT INTO products (name, price, brand, category, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
`);

insertProduct.run('Aceite Yamalube', 45000, 'Yamaha', 'Aceites', 'Aceite 4T 20W50', 'aceite.jpg');
insertProduct.finalize();

// Cerrar BD
db.close();
```

#### 2. Ejecutar Script

```bash
node db-access.js
```

---

## 📊 Estructura de la Base de Datos

### Tabla: products

Almacena el catálogo de productos.

```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    image TEXT,
    stock INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas:**
- `id`: ID único del producto
- `name`: Nombre del producto
- `price`: Precio en COP
- `brand`: Marca (Yamaha, Honda, Suzuki, Kawasaki)
- `category`: Categoría (Llantas, Baterías, Aceites, etc.)
- `description`: Descripción del producto
- `image`: Ruta de la imagen
- `stock`: Cantidad disponible
- `created_at`: Fecha de creación

### Tabla: users

Almacena usuarios registrados.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: orders

Almacena pedidos realizados.

```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    items TEXT NOT NULL,  -- JSON con productos
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_method TEXT,
    payment_method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabla: bot_training

Almacena patrones de entrenamiento del bot.

```sql
CREATE TABLE bot_training (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern TEXT NOT NULL,
    category TEXT NOT NULL,
    response TEXT NOT NULL,
    examples TEXT,  -- JSON con ejemplos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Operaciones Comunes

### Gestión de Productos

**Listar todos los productos:**

```sql
SELECT * FROM products;
```

**Buscar por marca:**

```sql
SELECT * FROM products WHERE brand = 'Yamaha';
```

**Buscar por categoría:**

```sql
SELECT * FROM products WHERE category = 'Llantas';
```

**Buscar por nombre (búsqueda parcial):**

```sql
SELECT * FROM products WHERE name LIKE '%llanta%';
```

**Productos más caros:**

```sql
SELECT * FROM products ORDER BY price DESC LIMIT 10;
```

**Productos por rango de precio:**

```sql
SELECT * FROM products WHERE price BETWEEN 50000 AND 150000;
```

**Agregar producto:**

```sql
INSERT INTO products (name, price, brand, category, description, image, stock)
VALUES ('Cadena 428H', 85000, 'Honda', 'Cadenas', 'Cadena de transmisión 428H', 'cadena.jpg', 15);
```

**Actualizar stock:**

```sql
UPDATE products SET stock = stock - 1 WHERE id = 5;
```

**Eliminar producto:**

```sql
DELETE FROM products WHERE id = 5;
```

### Gestión de Usuarios

**Listar usuarios:**

```sql
SELECT id, username, email, full_name, created_at FROM users;
```

**Buscar usuario por email:**

```sql
SELECT * FROM users WHERE email = 'usuario@example.com';
```

**Contar usuarios:**

```sql
SELECT COUNT(*) as total_users FROM users;
```

### Gestión de Pedidos

**Listar todos los pedidos:**

```sql
SELECT * FROM orders ORDER BY created_at DESC;
```

**Pedidos de un usuario:**

```sql
SELECT * FROM orders WHERE user_id = 1;
```

**Pedidos por estado:**

```sql
SELECT * FROM orders WHERE status = 'pending';
```

**Total de ventas:**

```sql
SELECT SUM(total) as total_sales FROM orders WHERE status = 'completed';
```

### Entrenamiento del Bot

**Listar entrenamientos:**

```sql
SELECT * FROM bot_training;
```

**Entrenamientos por categoría:**

```sql
SELECT * FROM bot_training WHERE category = 'greeting';
```

**Agregar entrenamiento:**

```sql
INSERT INTO bot_training (pattern, category, response, examples)
VALUES (
    '(hola|hi|hey)',
    'greeting',
    '¡Hola! ¿En qué puedo ayudarte?',
    '["hola", "hi", "hey", "buenos días"]'
);
```

---

## 🤖 Entrenamiento del Bot

### Guía Completa

Para entrenar el bot, usa el **Panel de Administración v14** (Método 1, más arriba).

Pero también puedes hacerlo por SQL:

```sql
-- Agregar patrón de saludo
INSERT INTO bot_training (pattern, category, response, examples)
VALUES (
    '(hola|hi|buenos días|buenas tardes)',
    'greeting',
    '¡Hola! 👋 Bienvenido a Repuestos Motos. ¿En qué puedo ayudarte hoy?',
    '["hola", "hi", "buenos días", "buenas tardes", "hey"]'
);

-- Agregar patrón de búsqueda
INSERT INTO bot_training (pattern, category, response, examples)
VALUES (
    '(busco|necesito|quiero|quisiera) (.*)',
    'product',
    'Déjame ayudarte a encontrar ese producto. ¿Para qué marca de moto lo necesitas?',
    '["busco llantas", "necesito una batería", "quiero aceite", "quisiera un filtro"]'
);

-- Agregar patrón de precio
INSERT INTO bot_training (pattern, category, response, examples)
VALUES (
    '(cuánto cuesta|precio|cuánto vale|valor) (.*)',
    'price',
    'El precio depende de la marca y modelo. ¿Qué producto específico te interesa?',
    '["cuánto cuesta una llanta", "precio de baterías", "cuánto vale el aceite"]'
);

-- Ver todos los entrenamientos
SELECT id, pattern, category, response FROM bot_training;

-- Actualizar respuesta
UPDATE bot_training
SET response = '¡Hola! 👋 Estoy aquí para ayudarte con repuestos de motos.'
WHERE id = 1;

-- Eliminar entrenamiento
DELETE FROM bot_training WHERE id = 5;
```

---

## 💾 Backup y Restore

### Backup con DB Browser

1. Abre la BD en DB Browser
2. Menú **File** → **Export** → **Database to SQL file**
3. Elige ubicación
4. Click en **Save**

### Backup con Línea de Comandos

```bash
# Backup completo
sqlite3 database.sqlite .dump > backup.sql

# Backup de una tabla específica
sqlite3 database.sqlite .dump products > products_backup.sql

# Restaurar desde backup
sqlite3 database_new.sqlite < backup.sql
```

### Backup con Panel de Admin v14

1. Abre el panel (🔧 o **Ctrl+Shift+A**)
2. Ve a "💾 Backup/Restore"
3. Click en "📄 Exportar JSON" (o SQL, CSV)
4. El archivo se descargará automáticamente

**Restaurar:**
1. Ve a "💾 Backup/Restore"
2. Click en "📂 Seleccionar Archivo"
3. Elige el archivo de backup
4. Los datos se importarán automáticamente

---

## 🎯 Resumen de Métodos

| Método | Dificultad | Ventajas | Mejor Para |
|--------|------------|----------|------------|
| **Panel Admin v14** | ⭐ Fácil | Visual, intuitivo, sin SQL | Usuarios no técnicos, entrenar bot |
| **DB Browser** | ⭐⭐ Media | Interfaz gráfica, SQL completo | Desarrolladores, consultas complejas |
| **Línea de Comandos** | ⭐⭐⭐ Difícil | Rápido, scriptable | Scripts, automatización |
| **VS Code Extension** | ⭐⭐ Media | Integrado en VS Code | Desarrollo rápido |
| **Node.js Script** | ⭐⭐⭐ Difícil | Automatizable, JavaScript | Integración con app |

---

## 📞 Ayuda

Si tienes problemas:

1. **Panel de Admin no abre:**
   - Verifica que el servidor esté corriendo (`npm start`)
   - Refresca la página (F5)
   - Intenta desde consola: `v14.openAdmin()`

2. **BD no se abre en DB Browser:**
   - Verifica que el archivo `database.sqlite` exista
   - Verifica permisos del archivo
   - Intenta copiar la BD a tu escritorio

3. **Comandos SQL fallan:**
   - Verifica la sintaxis
   - Verifica que la tabla exista (`.tables`)
   - Verifica los nombres de columnas (`.schema TABLE`)

---

**Generated with Claude Code**
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>
