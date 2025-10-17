# 🏍️ ChatBot Repuestos de Motos - E-commerce Completo v7.0

[![Version](https://img.shields.io/badge/version-7.0-blue.svg)](https://github.com/AndroidCatt/ProjectMotos/releases/tag/v7.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Made with ❤️](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-red.svg)](https://github.com/AndroidCatt)

> Sistema completo de e-commerce con chatbot inteligente, autenticación, checkout multi-paso, y gestión de pedidos para repuestos de motos colombianas.

[🚀 Ver Demo](#) | [📖 Documentación](README_V7.md) | [🛠️ Guía de Desarrollo](DEVELOPER_GUIDE.md) | [⚡ Inicio Rápido](QUICK_START.md)

---

## ✨ Características Principales

### 🔐 Autenticación Completa
- ✅ Login y registro de usuarios
- ✅ Gestión de sesiones (30 min timeout)
- ✅ Recuperación de contraseña
- ✅ Perfil de usuario editable (3 pestañas: Info, Dirección, Seguridad)
- ✅ Cuenta demo: `demo`/`demo123`

### 💳 Sistema de Checkout Multi-Paso
- ✅ **7 métodos de pago**: Tarjetas, PSE, Nequi, Daviplata, Efectivo, Transferencia
- ✅ **4 opciones de envío**: Estándar, Express, Mismo Día, Recoger en Tienda
- ✅ Proceso de 3 pasos con validación completa
- ✅ Cálculo automático de totales y descuentos
- ✅ Simulación de procesamiento de pago (95% tasa de éxito)

### 📦 Gestión de Pedidos
- ✅ Historial completo de pedidos del usuario
- ✅ Tracking con número de seguimiento único
- ✅ Timeline de estados con fechas y horas
- ✅ Estados: Confirmado, En Preparación, Enviado, En Tránsito, En Reparto, Entregado
- ✅ Opción de cancelar pedidos (excepto entregados)

### 🤖 Chatbot Inteligente
- ✅ Motor de IA con NLP (Procesamiento de Lenguaje Natural)
- ✅ **200+ productos** organizados por marca y modelo
- ✅ **Sistema de entrenamiento personalizable** (training-system.js)
- ✅ Chat por voz (Speech-to-Text en español Colombia)
- ✅ Detección de intenciones y extracción de entidades
- ✅ Respuestas contextuales y conversacionales

### 🎯 Funcionalidades Premium
- ❤️ **Sistema de favoritos** con persistencia
- 🛒 **Carrito de compras** con cantidades y totales
- 📄 **Exportación a PDF** (cotizaciones, favoritos, catálogo)
- ⚖️ **Comparación de productos** (hasta 4 simultáneos)
- 🏆 **Gamificación** (niveles, puntos, logros desbloqueables)
- 🎟️ **Sistema de cupones** y promociones con validación
- 📊 **Gráficos interactivos** con Chart.js (precios, ratings)
- 🎤 **Síntesis de voz** (Text-to-Speech) para respuestas
- 🔍 **Búsqueda inteligente** con autocompletado
- 🎨 **Modo oscuro** elegante
- 📱 **Diseño 100% responsive**

---

## 🚀 Inicio Rápido

### Opción 1: Abrir Directamente (Recomendado)

```bash
# Clona el repositorio
git clone https://github.com/AndroidCatt/ProjectMotos.git
cd ProjectMotos

# Abre index.html en tu navegador
# Windows:
start index.html
# Linux:
xdg-open index.html
# Mac:
open index.html
```

### Opción 2: Con Servidor Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Abrir en navegador
http://localhost:3000
```

### 🎯 Cuenta Demo para Pruebas
- **Usuario:** `demo`
- **Contraseña:** `demo123`

---

## 📖 Documentación Completa

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| [⚡ QUICK_START.md](QUICK_START.md) | Inicio rápido en 5 minutos | 200 |
| [🛠️ DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Guía completa de desarrollo y personalización | 860 |
| [📚 README_V7.md](README_V7.md) | Documentación detallada del nivel 7 | 640 |
| [📚 README_V6.md](README_V6.md) | Documentación del nivel 6 (IA, voz, PDF) | 670 |
| [📚 README_V5.md](README_V5.md) | Documentación del nivel 5 (precios, carrito) | 350 |
| [📝 CHANGELOG_V5.md](CHANGELOG_V5.md) | Registro de cambios nivel 5 | 270 |

---

## 🏗️ Arquitectura del Proyecto

```
chatbot-repuestos-motos/
│
├── 📄 index.html                    # Interfaz principal v7.0
├── 🎨 styles.css                    # Estilos completos (2889 líneas)
│
├── 🤖 LÓGICA DEL CHATBOT
│   ├── chatbot.js                   # Base de datos de 200+ productos
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
│   └── app-v7.js                    # Integración nivel 7 ⭐
│
├── 📚 DOCUMENTACIÓN
│   ├── README.md                    # Este archivo
│   ├── QUICK_START.md               # Inicio rápido
│   ├── DEVELOPER_GUIDE.md           # Guía de desarrollo
│   ├── README_V7.md                 # Docs nivel 7
│   ├── README_V6.md                 # Docs nivel 6
│   └── README_V5.md                 # Docs nivel 5
│
└── 🖥️ SERVIDOR (opcional)
    └── server-v3.js                 # Servidor Node.js + SQLite
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica completa
- **CSS3** - Grid, Flexbox, Animations, Variables CSS
- **JavaScript ES6+** - Classes, Async/Await, Modules, Destructuring
- **LocalStorage API** - Persistencia de datos en cliente

### APIs Web
- **Web Speech API** - Reconocimiento y síntesis de voz
- **jsPDF 2.5.1** - Generación de PDFs profesionales
- **Chart.js 4.4.0** - Gráficos interactivos (barras, radar)

### Backend (Opcional)
- **Node.js** - Entorno de ejecución
- **Express** - Framework web
- **SQLite** - Base de datos embebida

### Características del Código
- ✅ Programación Orientada a Objetos (POO)
- ✅ Patrón MVC simplificado
- ✅ Event-driven architecture
- ✅ State management con localStorage
- ✅ Responsive design con media queries
- ✅ Progressive enhancement

---

## 🎓 Personalización Rápida

### 1. Entrenar el Bot (Consola del navegador)

```javascript
// Inicializar sistema de entrenamiento
const trainer = new TrainingSystem();

// Ver estadísticas
trainer.getTrainingStats();

// Cambiar nombre y personalidad del bot
trainer.updatePersonality({
    name: 'MiBot Personalizado',
    tone: 'professional',  // friendly, professional, casual, enthusiastic
    useEmoji: true
});

// Agregar producto personalizado
trainer.addCustomProduct({
    name: 'Amortiguador Premium',
    brand: 'Yamaha',
    category: 'suspension',
    model: 'R15',
    price: 450000,
    discount: 15,
    rating: 4.9,
    stock: 10,
    image: '🔧'
});

// Agregar respuesta personalizada
trainer.addCustomResponse(
    'garantia',
    'garantía',
    'Todos nuestros productos tienen 1 año de garantía de fábrica.'
);

// Exportar toda la configuración
const config = trainer.exportTrainingData();
console.log(config);  // Copiar y guardar
```

### 2. Cambiar Colores del Tema

Edita `styles.css` líneas 7-16:

```css
:root {
    --primary-color: #667eea;    /* Azul principal */
    --secondary-color: #764ba2;  /* Morado secundario */
    --accent-color: #f093fb;     /* Rosa acento */
    --success-color: #4caf50;    /* Verde éxito */
}
```

### 3. Cambiar Logo/Avatar

Edita `index.html` línea 14:

```html
<div class="bot-avatar">🤖</div>  <!-- Cambia el emoji -->
```

Opciones: 🤖 🚀 💬 🔧 🏍️ ⚙️ 🛠️

---

## 📊 Estadísticas del Proyecto

### Líneas de Código
- **Total:** +10,200 líneas
- **JavaScript:** 4,560 líneas (10 archivos)
- **CSS:** 2,889 líneas (1 archivo)
- **HTML:** 392 líneas (1 archivo)
- **Documentación:** 2,500+ líneas (6 archivos)

### Contenido
- **Productos:** 200+ repuestos
- **Marcas:** 4 (Auteco, AKT, TVS, Boxer)
- **Modelos:** 15+ motos
- **Métodos de pago:** 7
- **Opciones de envío:** 4
- **Modales UI:** 12
- **Intents de IA:** 10+
- **Logros desbloqueables:** 8

---

## 🎯 Flujo de Uso Completo

### 1. Primera Visita
1. Abrir `index.html` en el navegador
2. Click en 👤 → "🔐 Iniciar Sesión"
3. Login con `demo`/`demo123` o crear cuenta

### 2. Explorar Productos
1. Escribir "hola" en el chat
2. Seleccionar: Auteco → Pulsar NS 125 → Motor
3. Ver productos con precios, descuentos, ratings
4. Usar 🔍 búsqueda rápida (opcional)

### 3. Agregar al Carrito
1. Click en 🛒 en cualquier producto
2. Ver badge del carrito actualizado
3. Ajustar cantidades desde el carrito

### 4. Realizar Compra
1. Click en botón del carrito (header)
2. Completar **Paso 1**: Información de envío
3. Completar **Paso 2**: Método de pago
4. Revisar **Paso 3**: Confirmación
5. Click "Confirmar y Pagar"

### 5. Ver Pedidos
1. Click en 👤 → "📦 Mis Pedidos"
2. Ver historial con estados
3. Click en pedido para ver timeline detallado

### 6. Otras Funciones
- ❤️ Favoritos: Guardar productos preferidos
- 📄 PDF: Exportar cotización o favoritos
- ⚖️ Comparar: Hasta 4 productos simultáneos
- 🎟️ Cupones: Aplicar códigos promocionales
- 👤 Perfil: Editar datos personales

---

## 🔌 API del Sistema de Entrenamiento

```javascript
// Crear instancia
const trainer = new TrainingSystem();

// Métodos disponibles
trainer.addCustomResponse(intent, pattern, response)
trainer.addCustomProduct(productData)
trainer.addExample(conversationExample)
trainer.updatePersonality(settings)
trainer.getTrainingStats()
trainer.exportTrainingData()
trainer.importTrainingData(jsonData)
trainer.resetTraining()
trainer.matchIntent(userInput)
trainer.getResponse(intent)
```

Ver [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) para documentación completa de la API.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Áreas de Contribución
- 🐛 Reportar bugs
- ✨ Sugerir nuevas funcionalidades
- 📝 Mejorar documentación
- 🌍 Traducciones
- 🎨 Mejorar UI/UX
- ⚡ Optimizaciones de rendimiento

---

## 📝 Changelog

### [7.0.0] - 2025-10-16 🚀
#### Agregado
- ✅ Sistema de autenticación completo (login/registro/recuperación)
- ✅ Checkout multi-paso con 7 métodos de pago
- ✅ Gestión y tracking completo de pedidos
- ✅ Sistema de entrenamiento del bot (training-system.js)
- ✅ Perfil de usuario con 3 pestañas editables
- ✅ 6 nuevos modales en la UI
- ✅ Documentación completa (DEVELOPER_GUIDE.md, QUICK_START.md)

#### Mejorado
- 🎨 +1,100 líneas de estilos CSS nivel 7
- 📦 Base de datos de 200+ productos
- 🤖 Motor de IA mejorado
- 📱 Responsive design optimizado

### [6.0.0] - 2025-10-15
#### Agregado
- ✅ Motor de IA con NLP
- ✅ Chat por voz (Speech-to-Text y Text-to-Speech)
- ✅ Exportación profesional a PDF
- ✅ Comparación de productos con gráficos
- ✅ Sistema de gamificación completo
- ✅ Cupones y promociones

### [5.0.0] - 2025-10-14
#### Agregado
- ✅ Sistema de precios en COP
- ✅ Descuentos dinámicos
- ✅ Carrito de compras funcional
- ✅ Sistema de favoritos
- ✅ Búsqueda rápida con autocompletado

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👤 Autor

**AndroidCatt**
- 🐙 GitHub: [@AndroidCatt](https://github.com/AndroidCatt)
- 📧 Email: gamep288@gmail.com
- 🔗 Proyecto: [ProjectMotos](https://github.com/AndroidCatt/ProjectMotos)

---

## 🙏 Agradecimientos

- **Claude (Anthropic)** - Asistencia en desarrollo con IA
- **jsPDF Team** - Librería de generación de PDFs
- **Chart.js Team** - Librería de gráficos interactivos
- **MDN Web Docs** - Documentación de referencia
- **Comunidad Open Source** - Inspiración y recursos

---

## 📞 Soporte

¿Necesitas ayuda?

- 📧 **Email:** gamep288@gmail.com
- 💬 **Issues:** [GitHub Issues](https://github.com/AndroidCatt/ProjectMotos/issues)
- 📚 **Documentación:** [Guía Completa](DEVELOPER_GUIDE.md)
- ⚡ **Inicio Rápido:** [Quick Start](QUICK_START.md)

---

## 🌟 Roadmap Futuro

### Nivel 8 (Planeado)
- [ ] PWA (Progressive Web App) completo
- [ ] Notificaciones Push
- [ ] Sistema de reviews y calificaciones
- [ ] Dashboard de administrador
- [ ] Chat en tiempo real con WebSockets
- [ ] Wishlist compartida
- [ ] Modo offline con Service Workers

### Largo Plazo
- [ ] Integración con pasarelas de pago reales
- [ ] Backend completo con API REST
- [ ] App móvil nativa (React Native)
- [ ] Sistema de recomendaciones con ML
- [ ] Multi-idioma (i18n)
- [ ] Panel de analytics

---

<p align="center">
  <strong>⭐ Si te gustó el proyecto, dale una estrella en GitHub ⭐</strong>
</p>

<p align="center">
  <a href="https://github.com/AndroidCatt/ProjectMotos">
    <img src="https://img.shields.io/github/stars/AndroidCatt/ProjectMotos?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/AndroidCatt/ProjectMotos/fork">
    <img src="https://img.shields.io/github/forks/AndroidCatt/ProjectMotos?style=social" alt="GitHub forks">
  </a>
</p>

<p align="center">
  <sub>Hecho con ❤️ y ☕ por <a href="https://github.com/AndroidCatt">AndroidCatt</a></sub>
</p>

---

**Versión 7.0** - ChatBot Repuestos de Motos Colombianas
© 2025 AndroidCatt. Todos los derechos reservados.
