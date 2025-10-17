# 🛠️ Guía de Desarrollo - ChatBot Repuestos de Motos

## 📚 Índice

1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Cómo Entrenar el Bot](#cómo-entrenar-el-bot)
4. [Personalización del Bot](#personalización-del-bot)
5. [Agregar Nuevos Productos](#agregar-nuevos-productos)
6. [Modificar Respuestas](#modificar-respuestas)
7. [Agregar Nuevas Funcionalidades](#agregar-nuevas-funcionalidades)
8. [Guía de Archivos](#guía-de-archivos)
9. [API del Sistema de Entrenamiento](#api-del-sistema-de-entrenamiento)
10. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 📖 Introducción

Esta guía te ayudará a entender, modificar y extender el ChatBot de Repuestos de Motos sin necesidad de ser un experto en programación.

### ¿Qué puedes hacer?

✅ **Entrenar el bot** con nuevas respuestas
✅ **Agregar productos** personalizados
✅ **Cambiar la personalidad** del bot
✅ **Modificar respuestas** existentes
✅ **Agregar nuevas marcas** y modelos
✅ **Personalizar la interfaz** (colores, estilos)
✅ **Extender funcionalidades** con nuevos módulos

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
chatbot-repuestos-motos/
│
├── 📄 index.html                    # Interfaz principal (HTML)
├── 🎨 styles.css                    # Todos los estilos (CSS)
│
├── 🤖 LÓGICA DEL CHATBOT
│   ├── chatbot.js                   # Datos base (marcas, productos)
│   ├── ai-engine.js                 # Motor de IA con NLP
│   └── training-system.js           # Sistema de entrenamiento ⭐
│
├── 🔐 AUTENTICACIÓN Y COMPRAS
│   ├── auth-system.js               # Login, registro, sesiones
│   ├── checkout-system.js           # Checkout, pagos, pedidos
│   └── voice-and-export.js          # Voz y exportación PDF
│
├── 🎯 INTEGRACIÓN
│   ├── app.js                       # Funciones UI nivel 5
│   ├── app-v6.js                    # Integración nivel 6
│   ├── app-v7.js                    # Integración nivel 7
│   └── app-v8.js                    # Integración nivel 8 (futuro)
│
├── 📚 DOCUMENTACIÓN
│   ├── README_V5.md                 # Docs nivel 5
│   ├── README_V6.md                 # Docs nivel 6
│   ├── README_V7.md                 # Docs nivel 7
│   └── DEVELOPER_GUIDE.md           # Esta guía ⭐
│
└── 🖥️ SERVIDOR (opcional)
    └── server-v3.js                 # Servidor Node.js + SQLite
```

### Flujo de Datos

```
Usuario escribe mensaje
        ↓
training-system.js detecta intención
        ↓
chatbot.js busca productos
        ↓
ai-engine.js procesa con NLP
        ↓
app.js renderiza UI
        ↓
Usuario ve respuesta
```

---

## 🎓 Cómo Entrenar el Bot

### Opción 1: Usando la Consola del Navegador (Fácil)

Abre la consola del navegador (F12) y usa estos comandos:

#### **1. Inicializar el Sistema de Entrenamiento**

```javascript
// El sistema ya está inicializado automáticamente
// Puedes acceder a él con:
const trainer = new TrainingSystem();
```

#### **2. Ver Estadísticas Actuales**

```javascript
trainer.getTrainingStats();

// Resultado:
// {
//   totalCustomResponses: 5,
//   totalIntents: 4,
//   totalCustomProducts: 0,
//   totalExamples: 3,
//   personality: "MotoBot",
//   lastUpdated: "Never"
// }
```

#### **3. Agregar Nueva Respuesta**

```javascript
// Agregar una respuesta para cuando el usuario pregunte por garantía
trainer.addCustomResponse(
    'warranty',                              // Intent (nombre)
    'garantía',                              // Patrón a detectar
    'Todos nuestros productos tienen 6 meses de garantía. ¿Te interesa alguno?' // Respuesta
);

// Agregar más patrones al mismo intent
trainer.addCustomResponse('warranty', 'cuanto dura la garantía', null);
trainer.addCustomResponse('warranty', 'tiene garantía', null);
```

#### **4. Agregar Producto Personalizado**

```javascript
trainer.addCustomProduct({
    name: 'Amortiguador Delantero Premium',
    brand: 'Yamaha',
    category: 'suspension',
    model: 'R15',
    price: 450000,
    discount: 15,
    rating: 4.8,
    stock: 5,
    image: '🔧',
    description: 'Amortiguador de alta calidad'
});
```

#### **5. Cambiar Personalidad del Bot**

```javascript
trainer.updatePersonality({
    name: 'RepuestoBot Pro',
    tone: 'professional',  // friendly, professional, casual, enthusiastic
    useEmoji: true,
    responseLength: 'long' // short, medium, long
});
```

#### **6. Exportar Configuración**

```javascript
// Exportar todo el entrenamiento a JSON
const data = trainer.exportTrainingData();

// Copiar al portapapeles
console.log(data);

// O descargar como archivo
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'bot-training-' + new Date().toISOString() + '.json';
a.click();
```

#### **7. Importar Configuración**

```javascript
// Desde JSON copiado
const jsonData = `{ ... tu JSON aquí ... }`;
trainer.importTrainingData(jsonData);

// O desde archivo (requiere upload)
// Ver sección de ejemplos más adelante
```

### Opción 2: Modificando Directamente `training-system.js`

Abre `training-system.js` y modifica la función `loadCustomResponses()`:

```javascript
loadCustomResponses() {
    return {
        greeting: {
            patterns: ['hola', 'buenos días', 'buenas'],
            responses: [
                '¡Hola! ¿Buscas repuestos hoy?',
                '¡Bienvenido! ¿En qué puedo ayudarte?'
            ],
            variableResponse: true
        },

        // AGREGAR TU NUEVO INTENT AQUÍ
        warranty: {
            patterns: ['garantía', 'cuánto dura', 'tiene garantía'],
            responses: [
                'Todos nuestros repuestos tienen 6 meses de garantía de fábrica.'
            ]
        }
    };
}
```

---

## 🎨 Personalización del Bot

### Cambiar Nombre del Bot

**Archivo:** `training-system.js` línea ~205

```javascript
loadPersonality() {
    return {
        name: 'TU_NOMBRE_AQUÍ',  // Cambia aquí
        tone: 'friendly',
        // ...
    };
}
```

### Cambiar Colores de la Interfaz

**Archivo:** `styles.css` línea 7-16

```css
:root {
    --primary-color: #667eea;    /* Color primario (azul) */
    --secondary-color: #764ba2;  /* Color secundario (morado) */
    --accent-color: #f093fb;     /* Color de acento (rosa) */
    --success-color: #4caf50;    /* Verde para éxito */
    --bg-color: #f0f2f5;         /* Fondo */
    --text-color: #333;          /* Texto */
    --light-gray: #e4e6eb;       /* Gris claro */
    --border-radius: 12px;       /* Redondeo de bordes */
}
```

**Ejemplo:** Cambiar a tema rojo/naranja:

```css
:root {
    --primary-color: #f44336;    /* Rojo */
    --secondary-color: #ff9800;  /* Naranja */
    --accent-color: #ffeb3b;     /* Amarillo */
}
```

### Cambiar Logo/Avatar del Bot

**Archivo:** `index.html` línea 14

```html
<div class="bot-avatar">🤖</div>  <!-- Cambia el emoji aquí -->
```

Opciones: 🤖 🚀 💬 🔧 🏍️ ⚙️

### Cambiar Mensaje de Bienvenida

**Archivo:** `index.html` líneas 50-67

```html
<h2>¡Bienvenido! 👋</h2>
<p>Soy tu asistente... [MODIFICA AQUÍ]</p>
```

---

## 🛍️ Agregar Nuevos Productos

### Método 1: Usando la Consola (Temporal)

```javascript
const trainer = new TrainingSystem();

trainer.addCustomProduct({
    name: 'Nombre del Producto',
    brand: 'Marca',              // Auteco, AKT, TVS, Boxer, o nueva
    category: 'motor',           // motor, frenos, suspension, etc.
    model: 'Modelo de Moto',     // o 'Universal'
    price: 100000,               // En pesos colombianos
    discount: 10,                // Porcentaje (0-100)
    rating: 4.5,                 // Estrellas (0-5)
    stock: 20,                   // Unidades disponibles
    image: '🔧',                 // Emoji representativo
    description: 'Descripción'   // Opcional
});
```

### Método 2: Modificando `chatbot.js` (Permanente)

**Archivo:** `chatbot.js` línea ~20

```javascript
this.motorcycleData = {
    'Auteco': {
        'Pulsar NS 125': {
            motor: [
                {
                    name: 'Kit de arrastre',
                    price: 120000,
                    discount: 10,
                    rating: 4.5,
                    stock: 15,
                    image: '🔧'
                },
                // AGREGAR TU PRODUCTO AQUÍ
                {
                    name: 'TU NUEVO PRODUCTO',
                    price: 50000,
                    discount: 0,
                    rating: 5.0,
                    stock: 10,
                    image: '⚙️'
                }
            ],
            // ... otras categorías
        }
    }
};
```

### Método 3: Agregar Nueva Marca Completa

**Archivo:** `chatbot.js`

```javascript
this.motorcycleData = {
    'Auteco': { ... },
    'AKT': { ... },
    'TVS': { ... },
    'Boxer': { ... },

    // AGREGAR NUEVA MARCA
    'Yamaha': {
        'R15': {
            motor: [
                { name: 'Producto 1', price: 100000, ... },
                { name: 'Producto 2', price: 150000, ... }
            ],
            frenos: [
                { name: 'Producto 3', price: 80000, ... }
            ]
        },
        'MT-03': {
            motor: [ ... ]
        }
    }
};
```

---

## 💬 Modificar Respuestas

### Respuestas Simples

**Archivo:** `training-system.js` función `loadCustomResponses()`

```javascript
greeting: {
    patterns: ['hola', 'hey'],  // Palabras que activan
    responses: [                  // Respuestas posibles
        'Tu respuesta 1',
        'Tu respuesta 2'
    ],
    variableResponse: true        // Alterna entre respuestas
}
```

### Respuestas con Variables

```javascript
// En la función formatResponse()
formatted = formatted.replace('{botName}', this.botPersonality.name);
formatted = formatted.replace('{userName}', context.userName || 'usuario');

// Uso:
responses: [
    'Hola {userName}, soy {botName}. ¿En qué puedo ayudarte?'
]
```

### Agregar Nueva Intención

```javascript
loadCustomIntents() {
    return {
        // ... intents existentes

        // NUEVO INTENT
        shipping: {
            patterns: ['envío', 'entrega', 'shipping', 'cuándo llega'],
            action: 'showShipping',
            description: 'Información de envío'
        }
    };
}
```

---

## ⚙️ Agregar Nuevas Funcionalidades

### Ejemplo 1: Agregar Botón en el Header

**Archivo:** `index.html` línea ~20

```html
<div class="header-actions">
    <!-- Botones existentes -->
    <button id="voice-btn" class="header-btn">🎤</button>

    <!-- TU NUEVO BOTÓN -->
    <button id="mi-boton" class="header-btn" title="Mi función">🎯</button>
</div>
```

**Archivo:** `app-v7.js` o crear `app-v8.js`

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const miBoton = document.getElementById('mi-boton');

    miBoton.addEventListener('click', () => {
        alert('¡Mi función personalizada!');
        // Tu código aquí
    });
});
```

### Ejemplo 2: Agregar Nuevo Modal

**Archivo:** `index.html` antes del cierre de `</body>`

```html
<!-- Mi Modal Personalizado -->
<div id="mi-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Mi Título</h2>
            <button class="modal-close" onclick="closeModal('mi-modal')">✕</button>
        </div>
        <div class="modal-body">
            <p>Contenido de mi modal</p>
        </div>
    </div>
</div>
```

**Función para abrir:**

```javascript
function abrirMiModal() {
    const modal = document.getElementById('mi-modal');
    modal.style.display = 'flex';
}
```

### Ejemplo 3: Agregar Nuevo Método de Pago

**Archivo:** `checkout-system.js` línea ~50

```javascript
initPaymentMethods() {
    return [
        // ... métodos existentes

        // NUEVO MÉTODO
        {
            id: 'bitcoin',
            name: 'Bitcoin',
            description: 'Pago con criptomonedas',
            icon: '₿',
            enabled: true,
            fees: 0
        }
    ];
}
```

---

## 📂 Guía de Archivos

### Archivos que DEBES modificar para personalizar:

| Archivo | Qué Modificar | Dificultad |
|---------|---------------|------------|
| `training-system.js` | Respuestas, personalidad | ⭐ Fácil |
| `chatbot.js` | Productos, marcas, modelos | ⭐ Fácil |
| `styles.css` (línea 7-16) | Colores del tema | ⭐ Fácil |
| `index.html` (línea 50-70) | Mensaje de bienvenida | ⭐ Fácil |
| `auth-system.js` | Lógica de autenticación | ⭐⭐ Medio |
| `checkout-system.js` | Métodos de pago/envío | ⭐⭐ Medio |
| `app-v7.js` | Funciones de interfaz | ⭐⭐⭐ Avanzado |

### Archivos que NO debes modificar (a menos que sepas lo que haces):

- `voice-and-export.js` - Sistema de voz y PDF
- `ai-engine.js` - Motor de IA
- `server-v3.js` - Servidor backend

---

## 🔌 API del Sistema de Entrenamiento

### Objeto Global `TrainingSystem`

```javascript
const trainer = new TrainingSystem();
```

### Métodos Disponibles

#### `addCustomResponse(intent, pattern, response)`
```javascript
trainer.addCustomResponse('greeting', 'hola', '¡Hola! ¿Cómo estás?');
```

#### `addCustomProduct(productData)`
```javascript
trainer.addCustomProduct({
    name: 'Producto',
    brand: 'Marca',
    category: 'categoria',
    price: 100000
});
```

#### `addExample(example)`
```javascript
trainer.addExample({
    userInput: 'necesito frenos para pulsar',
    intent: 'search',
    entities: { category: 'frenos', model: 'pulsar' },
    expectedResponse: 'Te muestro los frenos para Pulsar...'
});
```

#### `updatePersonality(settings)`
```javascript
trainer.updatePersonality({
    name: 'MiBot',
    tone: 'professional'
});
```

#### `getTrainingStats()`
```javascript
const stats = trainer.getTrainingStats();
console.log(stats);
```

#### `exportTrainingData()`
```javascript
const json = trainer.exportTrainingData();
console.log(json);
```

#### `importTrainingData(jsonData)`
```javascript
trainer.importTrainingData(jsonString);
```

#### `resetTraining()`
```javascript
trainer.resetTraining(); // Vuelve a valores por defecto
```

---

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Bot de Ferretería (Cambiar de Repuestos a Herramientas)

```javascript
// 1. Cambiar personalidad
trainer.updatePersonality({
    name: 'FerreteriaBot',
    tone: 'friendly'
});

// 2. Agregar productos de ferretería
trainer.addCustomProduct({
    name: 'Martillo Stanley 16oz',
    brand: 'Stanley',
    category: 'herramientas',
    model: 'Universal',
    price: 45000,
    discount: 5,
    rating: 4.7,
    stock: 25,
    image: '🔨'
});

trainer.addCustomProduct({
    name: 'Destornillador Phillips',
    brand: 'Truper',
    category: 'herramientas',
    price: 12000,
    discount: 0,
    rating: 4.5,
    stock: 50,
    image: '🔧'
});

// 3. Cambiar respuestas
trainer.addCustomResponse(
    'greeting',
    'hola',
    '¡Bienvenido a la ferretería! ¿Qué herramienta buscas hoy?'
);
```

### Ejemplo 2: Agregar Soporte para WhatsApp

```javascript
// En app-v8.js
function compartirPorWhatsApp(producto) {
    const mensaje = `¡Mira este producto!\n\n` +
                   `${producto.name}\n` +
                   `Precio: ${bot.formatPrice(producto.price)}\n` +
                   `Descuento: ${producto.discount}%\n\n` +
                   `¿Te interesa?`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

// Agregar botón en cada producto
```

### Ejemplo 3: Sistema de Puntos de Fidelidad

```javascript
// En app-v8.js
class LoyaltySystem {
    constructor() {
        this.points = this.loadPoints();
    }

    loadPoints() {
        return parseInt(localStorage.getItem('loyalty_points')) || 0;
    }

    addPoints(amount) {
        this.points += amount;
        localStorage.setItem('loyalty_points', this.points);
        return this.points;
    }

    redeemPoints(amount) {
        if (this.points >= amount) {
            this.points -= amount;
            localStorage.setItem('loyalty_points', this.points);
            return { success: true, remaining: this.points };
        }
        return { success: false, message: 'Puntos insuficientes' };
    }

    getDiscount() {
        // 100 puntos = $1000 de descuento
        return Math.floor(this.points / 100) * 1000;
    }
}
```

### Ejemplo 4: Importar/Exportar Productos desde Excel

```javascript
// Función para leer archivo CSV
function importProductsFromCSV(fileInput) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const trainer = new TrainingSystem();

        // Saltar header (primera línea)
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');

            if (cols.length >= 4) {
                trainer.addCustomProduct({
                    name: cols[0],
                    brand: cols[1],
                    category: cols[2],
                    price: parseFloat(cols[3]),
                    discount: parseFloat(cols[4]) || 0,
                    rating: parseFloat(cols[5]) || 4.0,
                    stock: parseInt(cols[6]) || 10,
                    image: cols[7] || '🔧'
                });
            }
        }

        alert('Productos importados exitosamente');
    };

    reader.readAsText(file);
}

// Uso en HTML:
// <input type="file" accept=".csv" onchange="importProductsFromCSV(this)">
```

---

## 🐛 Debugging y Testing

### Ver Logs en Consola

```javascript
// Activar modo debug
localStorage.setItem('debug_mode', 'true');

// Ver todos los datos del bot
console.log('Productos:', bot.motorcycleData);
console.log('Carrito:', bot.cart);
console.log('Favoritos:', bot.favorites);
console.log('Usuario:', authSystem.getCurrentUser());
```

### Limpiar Todo el LocalStorage

```javascript
// ⚠️ CUIDADO: Esto borrará TODO
localStorage.clear();
location.reload();
```

### Limpiar Solo Entrenamiento

```javascript
const trainer = new TrainingSystem();
trainer.resetTraining();
```

### Ver Estructura de Datos

```javascript
// Ver productos personalizados
const trainer = new TrainingSystem();
console.table(trainer.getCustomProducts());

// Ver respuestas
console.log(trainer.customResponses);

// Ver estadísticas
console.table(trainer.getTrainingStats());
```

---

## 📊 Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre respalda** tu configuración antes de hacer cambios grandes
   ```javascript
   const backup = trainer.exportTrainingData();
   localStorage.setItem('backup', backup);
   ```

2. **Prueba cambios** en la consola antes de modificar archivos

3. **Usa nombres descriptivos** para intents y productos

4. **Documenta** tus cambios personalizados

5. **Versiona** tus exportaciones
   ```javascript
   const filename = 'training-v' + new Date().toISOString() + '.json';
   ```

### ❌ DON'T (No hacer)

1. No modifiques archivos sin respaldo
2. No uses caracteres especiales en IDs
3. No elimines funciones existentes sin entender su impacto
4. No guardes información sensible en localStorage
5. No sobrecargues el bot con miles de productos (límite: ~500)

---

## 🚀 Despliegue en Producción

### Opción 1: GitHub Pages (Gratis)

1. Sube el proyecto a GitHub
2. Ve a Settings → Pages
3. Selecciona branch `main` y carpeta `/`
4. Tu sitio estará en `https://tu-usuario.github.io/chatbot-repuestos/`

### Opción 2: Netlify (Gratis)

1. Arrastra la carpeta del proyecto a netlify.com
2. ¡Listo! Se despliega automáticamente

### Opción 3: Servidor Propio

```bash
npm install
npm start
# Disponible en http://tu-servidor:3000
```

---

## 📞 Soporte

¿Tienes dudas?

- 📧 Email: soporte@repuestos.co
- 💬 GitHub Issues: [link-al-repo]/issues
- 📱 WhatsApp: +57 300 123 4567

---

## 📝 Changelog Personal

Mantén un registro de tus cambios:

```markdown
## [Mi Versión 1.0] - 2025-01-XX
### Agregado
- 50 nuevos productos de marca Yamaha
- Respuesta personalizada para preguntas de garantía
- Botón de compartir por WhatsApp

### Modificado
- Cambié los colores a rojo/naranja
- Actualicé mensaje de bienvenida

### Eliminado
- N/A
```

---

**¡Feliz desarrollo! 🎉**

Si esta guía te fue útil, compártela con otros desarrolladores.
