# 🚀 Inicio Rápido - ChatBot Repuestos v7.0

## 📖 Para Empezar YA

### Opción 1: Abrir Directamente (RECOMENDADO)

```bash
# En Windows desde WSL:
explorer.exe index.html

# O navega manualmente a:
\\wsl$\Ubuntu\home\jhon\chatbot-repuestos-motos\index.html
```

### Opción 2: Usar Servidor

```bash
npm start
# Luego abre: http://localhost:3000
```

---

## 🎯 Primeros Pasos

### 1. Prueba el Sistema Completo

1. **Login**
   - Click en 👤 (esquina superior derecha)
   - Usuario: `demo`
   - Contraseña: `demo123`

2. **Compra Algo**
   - Escribe "hola" en el chat
   - Selecciona: Auteco → Pulsar NS 125 → Motor
   - Agrega productos al carrito 🛒
   - Click en el carrito → Completa checkout

3. **Ver Tus Pedidos**
   - Click en 👤 → 📦 Mis Pedidos

---

## 🛠️ Personalización Rápida (5 minutos)

### Cambiar Colores

Abre `styles.css` línea 7 y cambia:

```css
:root {
    --primary-color: #667eea;    /* TU COLOR AQUÍ */
    --secondary-color: #764ba2;  /* TU COLOR AQUÍ */
}
```

### Cambiar Nombre del Bot

Abre la consola del navegador (F12) y escribe:

```javascript
const trainer = new TrainingSystem();
trainer.updatePersonality({
    name: 'TU_NOMBRE_AQUÍ',
    tone: 'friendly'  // o 'professional', 'casual', 'enthusiastic'
});
```

### Agregar Tu Primer Producto

En la consola:

```javascript
const trainer = new TrainingSystem();
trainer.addCustomProduct({
    name: 'Mi Producto',
    brand: 'Mi Marca',
    category: 'motor',
    price: 100000,
    discount: 10,
    rating: 5.0,
    stock: 20,
    image: '🔧'
});
```

---

## 📚 Archivos Importantes

| Archivo | Para Qué |
|---------|----------|
| `DEVELOPER_GUIDE.md` | **Guía completa** de desarrollo |
| `README_V7.md` | Documentación nivel 7 |
| `training-system.js` | Sistema de entrenamiento |
| `chatbot.js` | Datos de productos |
| `styles.css` | Estilos y colores |

---

## 🎓 Entrenar el Bot

### Consola del Navegador (F12)

```javascript
// Inicializar
const trainer = new TrainingSystem();

// Ver estadísticas
trainer.getTrainingStats();

// Agregar respuesta personalizada
trainer.addCustomResponse(
    'mi_intent',
    'palabra clave',
    'Respuesta del bot'
);

// Exportar configuración
const data = trainer.exportTrainingData();
console.log(data);  // Copia y guarda esto
```

---

## ⚡ Comandos Útiles

### Limpiar Todo

```javascript
localStorage.clear();
location.reload();
```

### Backup de Configuración

```javascript
const trainer = new TrainingSystem();
const backup = trainer.exportTrainingData();
localStorage.setItem('my_backup', backup);
console.log('✅ Backup guardado');
```

### Restaurar Backup

```javascript
const backup = localStorage.getItem('my_backup');
const trainer = new TrainingSystem();
trainer.importTrainingData(backup);
console.log('✅ Backup restaurado');
```

---

## 🆘 Solución de Problemas

### No veo la versión 7.0

1. Asegúrate de abrir `index.html` directamente (no el servidor)
2. Refresca la página (Ctrl+F5)
3. Limpia caché del navegador

### El bot no responde

1. Abre consola (F12)
2. Busca errores en rojo
3. Verifica que todos los archivos JS estén cargados

### Perdí mi configuración

```javascript
// Si guardaste backup:
const trainer = new TrainingSystem();
trainer.importTrainingData(tuBackupJSON);

// Si no:
trainer.resetTraining();  // Vuelve a valores por defecto
```

---

## 📖 Siguientes Pasos

1. Lee `DEVELOPER_GUIDE.md` - Guía completa
2. Lee `README_V7.md` - Documentación detallada
3. Experimenta en la consola del navegador
4. Modifica archivos de a uno a la vez
5. Siempre haz backup antes de cambios grandes

---

## 💡 Tips Pro

✅ Usa la consola para probar antes de modificar archivos
✅ Exporta tu configuración cada vez que hagas cambios
✅ Lee los comentarios en el código
✅ Usa Ctrl+F para buscar en archivos
✅ Abre solo un archivo a la vez para no confundirte

---

## 🎉 ¡Listo!

Ya tienes todo para usar y personalizar el chatbot.

**Siguiente:** Abre `DEVELOPER_GUIDE.md` para la guía completa de desarrollo.

---

**Versión 7.0** - ChatBot Repuestos de Motos Colombianas
