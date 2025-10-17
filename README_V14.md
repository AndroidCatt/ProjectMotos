# 🔧 Versión 14.0 Enterprise - Panel de Administración y IA Conversacional Avanzada

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Nuevas Funcionalidades](#nuevas-funcionalidades)
- [Panel de Administración](#panel-de-administración)
- [IA Conversacional Avanzada](#ia-conversacional-avanzada)
- [Acceso a la Base de Datos](#acceso-a-la-base-de-datos)
- [Entrenamiento del Bot](#entrenamiento-del-bot)
- [Guía de Uso](#guía-de-uso)
- [API y Comandos](#api-y-comandos)
- [Atajos de Teclado](#atajos-de-teclado)

---

## 🎯 Introducción

La **Versión 14.0 Enterprise** introduce un **Panel de Administración Completo** con interfaz visual intuitiva y un sistema de **IA Conversacional Avanzada** con procesamiento de lenguaje natural (NLP), análisis de sentimientos y context awareness.

### ✨ Resumen de Cambios

- **Panel de Admin Visual**: Gestiona todo el sistema sin código
- **Gestión de BD**: CRUD visual, SQL queries, schemas
- **Entrenamiento del Bot**: Interfaz intuitiva para entrenar patrones
- **IA Conversacional**: NLP, sentimientos, context awareness
- **Multi-turn Conversations**: Memoria de conversación
- **Backup/Restore**: Exporta/importa en JSON, SQL, CSV
- **Configuración Visual**: Personaliza sin tocar código
- **Analytics y Logs**: Métricas en tiempo real

---

## 🚀 Nuevas Funcionalidades

### 1. Panel de Administración Completo

El panel de administración proporciona acceso visual a todas las funciones del sistema:

#### Características Principales:

- **📊 Dashboard**: Vista general con estadísticas en tiempo real
- **🗄️ Gestión de BD**: Visualiza y edita tablas directamente
- **📦 Productos**: CRUD completo de productos
- **🤖 Entrenar Bot**: Agrega patrones de conversación
- **👥 Usuarios**: Gestiona usuarios del sistema
- **📋 Pedidos**: Administra pedidos y estados
- **⚙️ Configuración**: Personaliza el sistema visualmente
- **💾 Backup/Restore**: Exporta e importa datos fácilmente
- **📝 Logs**: Visualiza logs del sistema en tiempo real

### 2. IA Conversacional Avanzada

Sistema de procesamiento de lenguaje natural con capacidades avanzadas:

#### Capacidades de IA:

- **NLP (Natural Language Processing)**: Entiende intenciones del usuario
- **Análisis de Sentimientos**: Detecta emociones (positivo/negativo/neutral)
- **Context Awareness**: Recuerda conversaciones previas
- **Entity Extraction**: Extrae marcas, productos, precios, ciudades
- **Multi-turn Conversations**: Conversaciones naturales con seguimiento
- **Personalización**: Aprende preferencias del usuario
- **Intent Detection**: 8+ intents predefinidos (saludo, búsqueda, precio, etc.)

---

## 🔧 Panel de Administración

### Acceso al Panel

Hay **3 formas** de abrir el panel de administración:

#### Opción 1: Botón en el Header
1. Busca el botón **🔧** en el header de la aplicación
2. Click en el botón para abrir el panel

#### Opción 2: Atajo de Teclado
Presiona: **Ctrl + Shift + A** (Windows/Linux) o **Cmd + Shift + A** (Mac)

#### Opción 3: Consola de JavaScript
```javascript
v14.openAdmin()
```

### Secciones del Panel

#### 📊 Dashboard

Vista general del sistema con:
- Estadísticas de productos, usuarios, pedidos
- Actividad reciente
- Acciones rápidas (backup, entrenar bot, exportar)

#### 🗄️ Gestión de Base de Datos

**Características:**
- Visualiza todas las tablas disponibles
- CRUD visual (Crear, Leer, Actualizar, Eliminar)
- Ejecutar consultas SQL (simulado en cliente, real en servidor)
- Ver esquema de la BD
- Exportar tablas individuales

**Tablas Disponibles:**
- `products`: Catálogo de productos
- `users`: Usuarios del sistema
- `orders`: Pedidos realizados
- `bot_training`: Patrones de entrenamiento del bot

**Cómo ver una tabla:**
1. Ve a la sección "Base de Datos"
2. Click en una de las tarjetas de tabla
3. Se abrirá el visor de tabla con todos los registros
4. Puedes editar o eliminar registros

#### 📦 Gestión de Productos

- Agregar nuevos productos
- Editar productos existentes
- Eliminar productos
- Ver catálogo completo

#### 🤖 Entrenamiento del Bot

La sección más importante para personalizar el bot:

**Agregar Nuevo Entrenamiento:**

1. **Patrón** (Regex): Define qué mensajes del usuario detectar
   - Ejemplo: `(hola|hi|buenos días)` detecta saludos

2. **Categoría**: Clasifica el tipo de entrenamiento
   - Opciones: Saludo, Producto, Precio, Envío, Pago, Otro

3. **Respuesta del Bot**: Lo que el bot responderá
   - Ejemplo: "¡Hola! ¿En qué puedo ayudarte?"

4. **Ejemplos** (opcional): Ejemplos de mensajes de usuario
   - Ayuda al sistema a aprender mejor

**Filtrar Entrenamientos:**
- Por categoría (dropdown)
- Por búsqueda de texto

**Probar el Bot:**
- Click en "🧪 Probar Bot"
- Ingresa un mensaje de prueba
- Ve la respuesta que daría el bot

**Exportar/Importar:**
- Exporta entrenamientos a JSON
- Importa desde archivo JSON

#### ⚙️ Configuración del Sistema

Personaliza el sistema sin código:

**Configuraciones Disponibles:**
- Nombre del sitio
- Moneda (COP, USD)
- Nombre del bot
- Mensaje de bienvenida
- Activar/desactivar chatbot
- Activar/desactivar chat por voz

#### 💾 Backup y Restore

**Exportar Datos:**
- **JSON**: Formato completo con toda la estructura
- **SQL**: Script SQL con CREATE TABLE e INSERT
- **CSV**: Formato compatible con Excel/Google Sheets

**Importar Datos:**
1. Click en "Seleccionar Archivo"
2. Elige un archivo JSON, SQL o CSV
3. Los datos se importarán automáticamente

**Backup Automático:**
- Se guardan backups cada 24 horas en localStorage

#### 📝 Logs del Sistema

- Visualiza todos los eventos del sistema
- Filtros por tipo (info, success, warning, error)
- Exportar logs a archivo de texto
- Limpiar logs antiguos

---

## 🧠 IA Conversacional Avanzada

### Cómo Funciona

Cuando un usuario envía un mensaje:

1. **Análisis de Sentimiento**: Detecta si es positivo, negativo o neutral
2. **Detección de Intent**: Determina qué quiere el usuario (saludo, búsqueda, etc.)
3. **Extracción de Entidades**: Identifica marcas, productos, precios, ciudades
4. **Context Awareness**: Recuerda mensajes anteriores
5. **Generación de Respuesta**: Crea una respuesta personalizada
6. **Actualización de Contexto**: Guarda el estado para próximas conversaciones

### Intents Soportados

| Intent | Palabras Clave | Ejemplo |
|--------|----------------|---------|
| **Saludo** | hola, hi, buenos días | "Hola, ¿cómo estás?" |
| **Búsqueda** | busco, necesito, quiero | "Busco llantas para Yamaha" |
| **Precio** | cuánto cuesta, precio | "¿Cuánto vale la batería?" |
| **Envío** | envío, entrega, despacho | "¿Cuánto demora el envío?" |
| **Pago** | pago, forma de pago | "¿Cómo puedo pagar?" |
| **Queja** | problema, queja, error | "El producto está defectuoso" |
| **Gracias** | gracias, thanks | "Muchas gracias" |
| **Despedida** | adiós, chao, bye | "Hasta luego" |

### Entidades Extraídas

- **Marcas**: Yamaha, Honda, Suzuki, Kawasaki, Pulsar, AKT, etc.
- **Productos**: Llanta, batería, aceite, cadena, freno, filtro, etc.
- **Números**: Precios, cantidades
- **Ciudades**: Bogotá, Medellín, Cali, Barranquilla, etc.

### Análisis de Sentimientos

El sistema detecta el tono emocional:

- **Positivo** (+1): "Excelente servicio, muy contento"
- **Neutral** (0): "Ok, necesito información"
- **Negativo** (-1): "Terrible experiencia, producto defectuoso"

Si se detecta sentimiento **negativo**, el bot:
- Muestra empatía automáticamente
- Marca el caso para escalación (revisión por admin)

### Context Awareness

El bot recuerda:
- Conversaciones anteriores (últimos 20 mensajes)
- Preferencias del usuario (marca favorita, productos buscados)
- Última pregunta realizada por el bot

**Ejemplo de Conversación con Contexto:**

```
Usuario: "Busco llantas"
Bot: "¿Para qué marca de moto?"

Usuario: "Yamaha"
Bot: "Perfecto, tenemos varias llantas para Yamaha. ¿Cuál es tu presupuesto?"

Usuario: "Esa" (se refiere a una anterior)
Bot: [Recuerda el contexto y responde correctamente]
```

---

## 🗄️ Acceso a la Base de Datos

### Opción 1: Panel de Administración (Más Fácil)

1. Abre el panel de administración (🔧 o **Ctrl+Shift+A**)
2. Ve a la sección **"Base de Datos"**
3. Click en la tarjeta de la tabla que quieres ver
4. Edita, agrega o elimina registros visualmente

### Opción 2: DB Browser for SQLite (Recomendado)

**Pasos:**

1. **Descargar DB Browser:**
   - Visita: https://sqlitebrowser.org/
   - Descarga la versión para tu sistema operativo
   - Instala el programa

2. **Abrir la Base de Datos:**
   ```bash
   # La BD está en la raíz del proyecto
   cd /home/jhon/chatbot-repuestos-motos

   # Abre con DB Browser
   # O usa el menú File → Open Database → Selecciona database.sqlite
   ```

3. **Explorar Datos:**
   - Pestaña "Browse Data": Ver registros
   - Pestaña "Execute SQL": Ejecutar consultas
   - Pestaña "Database Structure": Ver esquema

### Opción 3: Línea de Comandos

```bash
# Entrar a la BD
sqlite3 database.sqlite

# Ver tablas
.tables

# Ver registros de una tabla
SELECT * FROM products;

# Agregar registro
INSERT INTO products (name, price, brand) VALUES ('Llanta Trasera', 150000, 'Yamaha');

# Actualizar registro
UPDATE products SET price = 140000 WHERE id = 1;

# Eliminar registro
DELETE FROM products WHERE id = 1;

# Salir
.quit
```

### Opción 4: VS Code Extension

1. Instala la extensión **"SQLite Viewer"** en VS Code
2. Click derecho en `database.sqlite` → "Open Database"
3. Explora las tablas visualmente

---

## 🤖 Entrenamiento del Bot

### Guía Paso a Paso

#### 1. Abrir Panel de Entrenamiento

**Opción A**: Panel de Admin
1. Abre el panel (🔧 o **Ctrl+Shift+A**)
2. Click en "🤖 Entrenar Bot"

**Opción B**: Atajo directo
- Presiona **Ctrl+Shift+T** (Training)

**Opción C**: Consola
```javascript
v14.openTraining()
```

#### 2. Agregar Nuevo Entrenamiento

**Ejemplo: Enseñar al bot sobre descuentos**

1. **Patrón (Regex):**
   ```
   (descuento|oferta|promoción|rebaja)
   ```
   Esto detectará cuando el usuario mencione descuentos.

2. **Categoría:** Selecciona "Otro"

3. **Respuesta:**
   ```
   ¡Tenemos descuentos especiales esta semana!
   - 10% en llantas
   - 15% en baterías
   - 20% en aceites

   ¿Te interesa alguna categoría en particular?
   ```

4. **Ejemplos** (uno por línea):
   ```
   ¿Tienen descuentos?
   Hay ofertas disponibles?
   Cuáles son las promociones?
   ```

5. Click en "💾 Guardar Entrenamiento"

#### 3. Probar el Entrenamiento

1. Click en "🧪 Probar Bot"
2. Ingresa: "¿Tienen descuentos?"
3. El bot debería responder con el mensaje que configuraste

#### 4. Gestionar Entrenamientos

- **Editar**: Click en el botón ✏️ de un entrenamiento
- **Eliminar**: Click en el botón 🗑️
- **Filtrar**: Usa el dropdown de categorías o la barra de búsqueda

#### 5. Exportar/Importar Entrenamientos

**Exportar:**
- Click en "📤 Exportar Entrenamientos"
- Se descargará un archivo JSON con todos los entrenamientos
- Usa esto para hacer backup o compartir entrenamientos

**Importar:**
- Click en "📥 Importar Entrenamientos"
- Selecciona un archivo JSON exportado previamente
- Los entrenamientos se agregarán automáticamente

### Mejores Prácticas para Entrenar

1. **Usa Regex para Variaciones:**
   ```
   (hola|hi|hey|qué tal|buenos días)
   ```

2. **Sé Específico con las Categorías:**
   - Ayuda a organizar y filtrar entrenamientos

3. **Incluye Ejemplos:**
   - El sistema aprende mejor con ejemplos reales

4. **Prueba Regularmente:**
   - Usa "🧪 Probar Bot" frecuentemente

5. **Usa Placeholders en Respuestas:**
   - `{product}`, `{brand}`, `{price}` se reemplazan automáticamente

---

## 📚 Guía de Uso

### Inicio Rápido

1. **Abrir la Aplicación:**
   ```bash
   npm start
   ```
   Abre http://localhost:3000

2. **Acceder al Panel de Admin:**
   - Click en el botón 🔧 en el header
   - O presiona **Ctrl+Shift+A**

3. **Entrenar el Bot:**
   - Ve a la sección "🤖 Entrenar Bot"
   - Agrega patrones y respuestas
   - Prueba con "🧪 Probar Bot"

4. **Gestionar la BD:**
   - Ve a "🗄️ Base de Datos"
   - Click en una tabla para verla
   - Edita registros visualmente

5. **Hacer Backup:**
   - Ve a "💾 Backup/Restore"
   - Click en "📄 Exportar JSON"
   - Guarda el archivo en un lugar seguro

### Flujo de Trabajo Típico

```
1. Configurar Sistema (⚙️ Configuración)
   ↓
2. Agregar Productos (📦 Productos)
   ↓
3. Entrenar Bot (🤖 Entrenar Bot)
   ↓
4. Probar Conversaciones (🧪 Probar Bot)
   ↓
5. Hacer Backup (💾 Backup)
   ↓
6. Monitorear Logs (📝 Logs)
```

---

## 🎮 API y Comandos

### Comandos de Consola

Abre la consola del navegador (F12) y usa estos comandos:

```javascript
// Abrir panel de admin
v14.openAdmin()

// Abrir entrenamiento
v14.openTraining()

// Abrir gestión de BD
v14.openDatabase()

// Crear backup rápido
v14.backup()

// Probar IA con mensaje
v14.testAI("Busco llantas para Yamaha")

// Ver métricas de conversación
v14.metrics()

// Ver estadísticas del sistema
v14.stats()

// Mostrar ayuda
v14.help()
```

### API de IA Conversacional

```javascript
// Procesar mensaje con IA
const response = await window.aiConversational.processMessage("Hola");

console.log(response.text);        // Respuesta del bot
console.log(response.intent);      // Intent detectado
console.log(response.entities);    // Entidades extraídas
console.log(response.sentiment);   // Análisis de sentimiento

// Obtener métricas
const metrics = window.aiConversational.getConversationMetrics();
console.log(metrics);

// Exportar conversación
const conversation = window.aiConversational.exportConversation();
console.log(conversation);

// Agregar intent personalizado
window.aiConversational.addCustomIntent(
    'pedido_estado',
    ['estado de mi pedido', 'dónde está mi pedido', 'tracking'],
    ['Déjame verificar el estado de tu pedido. ¿Cuál es tu número de orden?']
);

// Limpiar historial
window.aiConversational.clearHistory();
```

### API del Panel de Admin

```javascript
// Acceder al panel
const admin = window.adminPanelAdvanced;

// Cambiar de pestaña
admin.switchTab('training');  // dashboard, database, products, training, users, orders, config, backup, logs

// Ver tabla de BD
admin.viewTable('products');

// Exportar backup
admin.exportBackup('json');  // 'json', 'sql', 'csv'

// Agregar log
admin.log('Mi mensaje de log', 'success');  // 'info', 'success', 'warning', 'error'

// Obtener estadísticas
const stats = admin.getSystemStats();
console.log(stats);
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| **Ctrl+Shift+A** | Abrir Panel de Administración |
| **Ctrl+Shift+D** | Ir a Dashboard |
| **Ctrl+Shift+T** | Ir a Entrenamiento del Bot |
| **Ctrl+Shift+B** | Crear Backup Rápido |

En Mac, usa **Cmd** en lugar de **Ctrl**.

---

## 📊 Estadísticas del Proyecto

### Archivos Nuevos en v14.0

| Archivo | Líneas | Descripción |
|---------|--------|-------------|
| **admin-panel-advanced.js** | 1,050 | Panel de administración completo |
| **ai-conversational-advanced.js** | 800 | Sistema de IA conversacional |
| **app-v14.js** | 650 | Integración nivel 14 |
| **README_V14.md** | 400+ | Esta documentación |

**Total nuevo en v14:** ~2,900 líneas de código

### Total Acumulado

- **Total líneas de código:** 19,300+
- **Total archivos JS:** 31
- **Total sistemas:** 28+
- **Idiomas soportados:** 4

---

## 🔄 Integración con Versiones Anteriores

La v14 es **100% compatible** con todas las versiones anteriores. Todos los sistemas de v5-v13 siguen funcionando:

✅ Autenticación (v7)
✅ Checkout y Pagos (v7)
✅ PWA y Reviews (v8)
✅ ML y i18n (v9)
✅ GraphQL y Redis (v10)
✅ Blockchain y Video Calls (v11)
✅ Kubernetes y Monitoring (v12)
✅ Messaging y Push (v13)
✅ **Admin Panel y IA (v14)** ← NUEVO

---

## 🐛 Troubleshooting

### El botón 🔧 no aparece

**Solución:**
1. Refresca la página (F5)
2. Verifica la consola por errores
3. Asegúrate de que `app-v14.js` esté cargado

### El panel no se abre

**Solución:**
1. Verifica que los scripts estén cargados:
   ```javascript
   console.log(typeof AdminPanelAdvanced);  // Debe ser "function"
   ```
2. Intenta desde consola: `v14.openAdmin()`

### Los entrenamientos no se guardan

**Solución:**
- Los entrenamientos se guardan en `localStorage`
- Verifica que tu navegador permita localStorage
- Exporta a JSON como backup

### La IA no responde correctamente

**Solución:**
1. Verifica que el entrenamiento esté agregado
2. Prueba con "🧪 Probar Bot"
3. Revisa los logs en la pestaña "📝 Logs"

---

## 🎯 Próximos Pasos

### Nivel 15 (Futuro)

Posibles funcionalidades para v15:
- Editor visual de flujos de conversación (drag & drop)
- Integración con OpenAI GPT
- Testing automatizado del bot
- Analytics de conversaciones con dashboards
- Multi-tenancy (múltiples tiendas)
- API pública para integraciones

---

## 📞 Soporte

Para más información:
- **Documentación completa:** Ver [DATABASE_ACCESS_GUIDE.md](DATABASE_ACCESS_GUIDE.md)
- **Changelog:** Ver historial de commits
- **Issues:** Reporta problemas en el repositorio

---

## 🎉 Conclusión

La **Versión 14.0 Enterprise** transforma el sistema en una plataforma completamente administrable con IA conversacional avanzada. Ahora puedes:

✅ Gestionar todo visualmente sin código
✅ Entrenar el bot con interfaz intuitiva
✅ Acceder a la BD de múltiples formas
✅ Hacer backups con un click
✅ Monitorear logs en tiempo real
✅ Personalizar el sistema fácilmente

**¡Disfruta de la v14.0!** 🚀

---

**Generated with Claude Code**
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>
