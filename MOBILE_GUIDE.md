# 📱 Guía Completa de Instalación Móvil v15.0

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Instalación en Android](#instalación-en-android)
- [Instalación en iOS (iPhone/iPad)](#instalación-en-ios-iphoneipad)
- [Acceso desde la Red Local](#acceso-desde-la-red-local)
- [Despliegue con Ngrok (Internet)](#despliegue-con-ngrok-internet)
- [Uso Offline](#uso-offline)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Introducción

La **Versión 15.0 Enterprise** está completamente optimizada para dispositivos móviles. Puedes **instalarla como una app nativa** en tu celular (Android o iOS) y usarla **sin conexión**.

### ✨ Características Móviles:

- 📱 Instalación como app nativa (PWA)
- 🔌 Funciona sin conexión (offline)
- 🔄 Sincronización automática al reconectar
- 👆 Gestos táctiles avanzados
- 📲 Notificaciones push
- 🚀 Optimizada para móviles
- 🔋 Bajo consumo de batería

---

## 🤖 Instalación en Android

### Método 1: Desde la Red Local (Más Rápido)

Este método funciona si tu celular y computadora están en la **misma red WiFi**.

#### Paso 1: Obtener la IP de tu Computadora

**En Linux/Mac:**
```bash
hostname -I
# O
ifconfig | grep "inet "
```

**En Windows:**
```bash
ipconfig
# Busca "IPv4 Address"
```

Ejemplo de IP: `192.168.1.100`

#### Paso 2: Iniciar el Servidor

En tu computadora:
```bash
cd /home/jhon/chatbot-repuestos-motos
npm start
```

El servidor se iniciará en el puerto 3000.

#### Paso 3: Acceder desde el Celular

1. Abre **Chrome** en tu Android
2. En la barra de dirección, escribe:
   ```
   http://TU_IP:3000
   ```
   Ejemplo: `http://192.168.1.100:3000`

3. Presiona **Enter**
4. La app se cargará

#### Paso 4: Instalar la App

**Opción A: Banner Automático** (Aparece después de 3 segundos)
1. Espera a que aparezca el banner verde "¡Instala la App!"
2. Toca **"Instalar"**
3. Confirma la instalación
4. ¡Listo! El ícono aparecerá en tu pantalla de inicio

**Opción B: Botón Flotante**
1. Busca el botón flotante verde con 📱 en la esquina inferior derecha
2. Toca el botón
3. Confirma la instalación

**Opción C: Menú de Chrome**
1. Toca los **3 puntos** (⋮) en la esquina superior derecha
2. Selecciona **"Agregar a pantalla de inicio"** o **"Instalar app"**
3. Toca **"Agregar"** o **"Instalar"**
4. El ícono aparecerá en tu pantalla de inicio

#### Paso 5: Usar la App

1. Ve a tu pantalla de inicio
2. Busca el ícono "Repuestos Motos"
3. Toca para abrir
4. ¡La app se abrirá como una aplicación nativa!

---

### Método 2: Desde Internet con Ngrok

Este método permite acceder desde cualquier lugar del mundo.

#### Paso 1: Instalar Ngrok

```bash
# Descargar ngrok
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# O descarga manualmente desde: https://ngrok.com/download
```

#### Paso 2: Crear Cuenta en Ngrok

1. Ve a: https://dashboard.ngrok.com/signup
2. Crea una cuenta gratuita
3. Copia tu **authtoken**

#### Paso 3: Configurar Ngrok

```bash
ngrok config add-authtoken TU_AUTH_TOKEN
```

#### Paso 4: Iniciar el Servidor

Terminal 1:
```bash
cd /home/jhon/chatbot-repuestos-motos
npm start
```

Terminal 2:
```bash
ngrok http 3000
```

#### Paso 5: Obtener la URL Pública

Ngrok mostrará algo como:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

Copia la URL: `https://abc123.ngrok.io`

#### Paso 6: Acceder desde el Celular

1. Abre **Chrome** en tu Android
2. Ingresa la URL de ngrok: `https://abc123.ngrok.io`
3. Presiona **Enter**
4. La app se cargará

#### Paso 7: Instalar la App

Sigue los mismos pasos del **Método 1, Paso 4**.

---

## 🍎 Instalación en iOS (iPhone/iPad)

iOS tiene restricciones más estrictas, pero aún puedes instalar la app.

### Paso 1: Acceder a la App

Usa **Método 1** (Red Local) o **Método 2** (Ngrok) para acceder a la URL en tu iPhone/iPad.

**IMPORTANTE:** Debes usar **Safari**. Chrome y otros navegadores NO soportan instalación de PWAs en iOS.

### Paso 2: Abrir en Safari

1. Abre **Safari** (no Chrome)
2. Ingresa la URL (ejemplo: `http://192.168.1.100:3000`)
3. Presiona **Enter**
4. La app se cargará

### Paso 3: Ver Instrucciones de Instalación

La app detectará automáticamente que estás en iOS y mostrará instrucciones.

Si no aparecen, puedes verlas aquí:

### Paso 4: Instalar en iOS

1. Toca el botón **Compartir** (⎙) en la barra inferior de Safari
2. Desliza hacia abajo en el menú
3. Toca **"Agregar a pantalla de inicio"** (⊕)
4. (Opcional) Edita el nombre: "Repuestos Motos"
5. Toca **"Agregar"** en la esquina superior derecha
6. ¡Listo! El ícono aparecerá en tu pantalla de inicio

### Paso 5: Usar la App

1. Ve a tu pantalla de inicio
2. Busca el ícono "Repuestos Motos"
3. Toca para abrir
4. La app se abrirá en modo standalone (sin barras de Safari)

---

## 🌐 Acceso desde la Red Local

### ¿Qué es la Red Local?

Es la red WiFi de tu casa u oficina. Todos los dispositivos conectados al mismo router pueden comunicarse entre sí.

### Ventajas:
- ✅ Rápido y sin lag
- ✅ No necesita internet
- ✅ Gratis
- ✅ Seguro (solo tu red local)

### Desventajas:
- ❌ Solo funciona en tu red WiFi
- ❌ No accesible desde fuera de casa

### Configuración:

1. **Asegúrate de que ambos dispositivos estén en el mismo WiFi**
   - Computadora: Conectada al WiFi "Mi Casa"
   - Celular: Conectado al WiFi "Mi Casa"

2. **Obtén la IP de tu computadora** (ver arriba)

3. **Accede desde el celular**: `http://TU_IP:3000`

### Solución de Problemas:

**No puedo acceder desde el celular:**

1. Verifica que ambos estén en el mismo WiFi
2. Verifica que el firewall permita conexiones en el puerto 3000:
   ```bash
   # Linux
   sudo ufw allow 3000

   # Windows
   # Ve a Firewall de Windows > Regla de entrada > Permitir puerto 3000
   ```

3. Intenta con la IP correcta:
   ```bash
   # En la computadora
   ip addr show | grep "inet "
   ```

---

## 🌍 Despliegue con Ngrok (Internet)

### ¿Qué es Ngrok?

Ngrok crea un **túnel** desde tu servidor local a una URL pública en internet.

### Ventajas:
- ✅ Accesible desde cualquier lugar del mundo
- ✅ HTTPS automático (seguro)
- ✅ Fácil de configurar
- ✅ Gratis (con limitaciones)

### Desventajas:
- ❌ URL cambia cada vez que reinicias ngrok (versión gratuita)
- ❌ Puede ser más lento
- ❌ Requiere que tu computadora esté encendida

### Plan Gratuito de Ngrok:

- ✅ 1 túnel simultáneo
- ✅ HTTPS incluido
- ❌ URL aleatoria (cambia al reiniciar)
- ⏱️ 2 horas de tiempo de sesión

### Plan Pro de Ngrok ($8/mes):

- ✅ 3 túneles simultáneos
- ✅ URLs personalizadas (ejemplo: `miapp.ngrok.io`)
- ✅ Sin límite de tiempo
- ✅ Más ancho de banda

### Configuración Avanzada:

**Usar una URL Personalizada (Plan Pro):**

```bash
ngrok http 3000 --subdomain=miapp
# URL será: https://miapp.ngrok.io
```

**Autenticación Básica:**

```bash
ngrok http 3000 --auth="usuario:contraseña"
```

**Ver Dashboard de Ngrok:**

Abre: http://localhost:4040

Aquí puedes ver:
- Requests en tiempo real
- Estadísticas
- Logs

---

## 🔌 Uso Offline

Una vez instalada, la app funciona **sin conexión**.

### Características Offline:

1. **Datos Guardados Localmente:**
   - Catálogo de productos
   - Carrito de compras
   - Favoritos
   - Historial de conversaciones
   - Configuración

2. **Sincronización Automática:**
   - Al reconectar, sincroniza cambios automáticamente
   - Cola de operaciones pendientes
   - Indicador visual de estado

3. **Indicador de Conexión:**
   - 🟢 **Online**: Conectado a internet
   - 🔴 **Offline**: Sin conexión
   - 🟡 **Sincronizando**: Subiendo cambios

### Usar Offline:

1. **Instala la app** siguiendo los pasos de arriba
2. **Usa la app normalmente** con conexión la primera vez
3. **Cierra el navegador** y apaga el WiFi
4. **Abre la app** desde el ícono en tu pantalla de inicio
5. ¡La app funciona sin conexión!

### Sincronización:

Cuando recuperes la conexión:
1. La app detecta automáticamente
2. Aparece notificación: "🌐 Conexión restaurada"
3. Se sincronizan automáticamente los cambios
4. Aparece: "✅ X operación(es) sincronizada(s)"

---

## 🔧 Troubleshooting

### Problema: "No puedo acceder desde el celular"

**Solución:**
1. Verifica que ambos estén en el mismo WiFi
2. Verifica la IP:
   ```bash
   hostname -I
   ```
3. Intenta con `http://` no `https://`
4. Verifica el firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 3000
   ```

### Problema: "El botón de instalar no aparece"

**Solución Android:**
1. Verifica que estés usando **Chrome**
2. Espera 3 segundos (el banner aparece automáticamente)
3. Intenta desde el menú de Chrome: ⋮ → "Agregar a pantalla de inicio"

**Solución iOS:**
1. Verifica que estés usando **Safari** (no Chrome)
2. Usa el botón Compartir (⎙) → "Agregar a pantalla de inicio"

### Problema: "La app no funciona offline"

**Solución:**
1. Asegúrate de haber instalado la app (no solo agregado acceso directo)
2. Usa la app al menos una vez con conexión
3. Verifica que el Service Worker esté registrado:
   - Abre la app
   - Inspeccionar (F12 en desktop)
   - Application → Service Workers
   - Debe aparecer "Activated and is running"

### Problema: "Ngrok dice 'Failed to connect'"

**Solución:**
1. Verifica que el servidor esté corriendo: `npm start`
2. Verifica que el puerto sea correcto: `3000`
3. Intenta reiniciar ngrok:
   ```bash
   # Ctrl+C para detener
   ngrok http 3000
   ```

### Problema: "La sincronización no funciona"

**Solución:**
1. Abre la consola del navegador (F12)
2. Escribe: `v15.syncStatus()`
3. Verifica que `isOnline: true`
4. Intenta sincronizar manualmente: `v15.syncNow()`

### Problema: "La app está lenta en el celular"

**Solución:**
1. Cierra otras apps en el celular
2. Limpia caché del navegador
3. Reinstala la app:
   - Desinstala (mantén presionado el ícono → Desinstalar)
   - Instala de nuevo siguiendo los pasos

### Problema: "No puedo ver las notificaciones"

**Solución:**
1. Verifica permisos de notificaciones:
   - Android: Ajustes → Apps → Repuestos Motos → Notificaciones → Activar
   - iOS: Ajustes → Notificaciones → Repuestos Motos → Permitir notificaciones

2. En la app, abre la consola (F12 en desktop):
   ```javascript
   Notification.permission
   // Debe decir "granted"
   ```

---

## 🎯 Resumen de Opciones

| Método | Ventajas | Desventajas | Mejor Para |
|--------|----------|-------------|------------|
| **Red Local** | Rápido, gratis, seguro | Solo en tu WiFi | Uso en casa/oficina |
| **Ngrok Gratis** | Acceso desde internet, gratis | URL cambia, límite 2h | Pruebas y demos |
| **Ngrok Pro** | URL fija, sin límites | $8/mes | Producción temporal |
| **Servidor VPS** | Permanente, profesional | Requiere configuración | Producción real |

---

## 📲 Comandos Útiles

En la consola del navegador (F12):

```javascript
// Instalar PWA
v15.installPWA()

// Información del dispositivo
v15.deviceInfo()

// Estado de sincronización
v15.syncStatus()

// Sincronizar ahora
v15.syncNow()

// Compartir
v15.share({ title: 'Repuestos Motos', text: 'Mira esta app' })

// Vibrar (solo móvil)
v15.vibrate(200)

// Ayuda
v15.help()
```

---

## 🚀 Próximos Pasos

Después de instalar:

1. ✅ **Explora la app** - Navega por el catálogo
2. ✅ **Prueba offline** - Apaga WiFi y verifica que funcione
3. ✅ **Panel de Admin** - Toca 🔧 o Ctrl+Shift+A
4. ✅ **Entrena el bot** - Ve a 🤖 Entrenar Bot
5. ✅ **Comparte** - Usa el botón de compartir

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa esta guía** - La mayoría de problemas tienen solución aquí
2. **Consulta los logs** - Abre la consola (F12) y busca errores
3. **Prueba los comandos** - Usa `v15.help()` para diagnóstico

---

**Generated with Claude Code**
https://claude.com/claude-code

Co-Authored-By: Claude <noreply@anthropic.com>
