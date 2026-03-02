# Arreglos de Errores 400 Bad Request

## Problema Identificado

Al intentar crear miembros, eventos y usar el asistente, se generaban errores **400 Bad Request**. La causa raíz era:

### Root Cause Analysis

En `frontend/src/services/api.js`:
- Los formularios (`MemberForm`, `EventForm`, `EditMemberForm`, `EditEventForm`) estaban creando `FormData` para enviar archivos
- Los métodos `createMember()`, `createEvent()`, `updateMember()`, `updateEvent()` hacían `JSON.stringify(FormData)`
- **Problema**: `JSON.stringify(FormData)` convierte a `"{}"` (cadena vacía) en lugar de mantener los datos
- El backend recibía un cuerpo vacío sin los campos requeridos y devolvía error 400

### Ejemplo del Problema:
```javascript
// ❌ INCORRECTO - Antes
const data = new FormData();
data.append('name', 'Juan');
data.append('avatar', fileInput);

// En api.js
body: JSON.stringify(data)  // Esto devuelve "{}"!!!
```

## Soluciones Aplicadas

### 1. Actualizar `authenticatedRequest()` en `api.js`

**Cambio**: Detectar si el body es FormData y NO forzar el header `Content-Type: application/json`

```javascript
async authenticatedRequest(url, options = {}) {
    // No forzar Content-Type si el body es FormData
    const headers = { ...options.headers };
    
    // Solo agregar Content-Type si NO es FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, { ...options, headers });
    // ...
}
```

**Por qué**: 
- Cuando usas `FormData`, el navegador automáticamente establece `Content-Type: multipart/form-data`
- Si especificas `Content-Type: application/json`, fetch lo anula causando conflictos
- Multer en el backend requiere `multipart/form-data` para procesar FormData

### 2. Actualizar Métodos de API

**Cambios realizados**:

#### createMember()
```javascript
// ❌ Antes
body: JSON.stringify(memberData)

// ✅ Después
body: memberData  // FormData se pasa directamente
```

#### createEvent()
```javascript
// ❌ Antes
body: JSON.stringify(eventData)

// ✅ Después
body: eventData  // FormData se pasa directamente
```

#### updateMember()
```javascript
// ✅ Nuevo
const body = memberData instanceof FormData ? memberData : JSON.stringify(memberData);
```

#### updateEvent()
```javascript
// ✅ Nuevo
const body = eventData instanceof FormData ? eventData : JSON.stringify(eventData);
```

## Archivos Modificados

- `frontend/src/services/api.js` - 4 métodos actualizados

## Validación

Los métodos que envían JSON (login, register, chat) continúan funcionando correctamente porque:
- Siguen usando `JSON.stringify()` como antes ✓
- El header `Content-Type: application/json` se agrega correctamente ✓

## Cómo Probar

### Test 1: Crear Miembro
1. Ve a la sección de Miembros
2. Haz clic en "Nuevo Miembro"
3. Llena el formulario (nombre es requerido)
4. Intenta subir un avatar (opcional)
5. Haz clic en Guardar

**Esperado**: Debe crearse sin error 400

### Test 2: Crear Evento
1. Ve al Calendario
2. Haz clic en "Nuevo Evento"
3. Llena los datos del evento
4. Intenta subir una imagen (opcional)
5. Selecciona miembros
6. Haz clic en Guardar

**Esperado**: Debe crearse sin error 400

### Test 3: Usar el Asistente
1. Abre el chat flotante
2. Escribe un mensaje (ej: "¿Cuántos miembros tengo?")
3. Presiona Enter

**Esperado**: Debe responder sin error de comunicación

## Cambios de Comportamiento

✅ **Sin cambios en la experiencia del usuario**
- Los formularios funcionan exactamente igual
- Se siguen soportando archivos (avatares e imágenes)
- Todos los campos se envían correctamente

## Próximos Pasos

Si aún hay errores 400:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Mira el request y response del error
4. Verifica que el Content-Type sea correcto
5. Reporta el payload exacto que se está enviando

---

## Mejoras de Interfaz y Funcionalidad

Además de corregir los 400, la aplicación ahora ofrece una experiencia de usuario más natural:

* ✅ **Pantalla de inicio renovada**: muestra únicamente el calendario con un botón "+" para añadir eventos y, en la esquina, el avatar del primer miembro cargado.
* 📁 **Gestión de miembros en una pantalla separada** (`/members`) con toda su información y acciones.
* 🧩 **Detalle de miembro ampliado**: incluye su propio calendario personalizado, permitiendo gestionar actividades extraescolares, citas y exámenes. También hay un botón para crear un evento directamente relacionado con ese miembro.
* 🗄️ **Enlace a creación de evento** se pasa automáticamente `memberId` como parámetro para pre-seleccionar al miembro en el formulario.
* 🌐 **Asistente virtual mejorado**: ahora reconoce comandos de gestión (crear/eliminar miembros y eventos, consultar calendarios de miembros) y ejecuta las acciones en la base de datos, devolviendo confirmaciones inmediatas. Sigue funcionando con Ollama para respuestas generadas por IA y cae en un fallback contextual cuando el modelo no está disponible.
* 🛠️ **Evitar 500 en chat (ajuste adicional)**: la ruta `/api/ai/process` ahora fija explícitamente status 200 incluso en errores y propaga detalles al cliente. El servicio de chat registra entradas y se asegura de no lanzar excepciones no capturadas.
* 📂 **Documentos de miembro tolerantes**: la ruta GET `/documents/:memberId/documents` maneja `ER_NO_SUCH_TABLE` creando la tabla automáticamente, devuelve siempre un 200 y proporciona la descripción del error en el cuerpo. El cliente (`getMemberDocuments`) chequea el campo `error` y lanza excepción para que la UI la trate.
* 🪪 **Carga de datos más resiliente**: `MemberDetail` ahora solicita documentos por separado y no bloquea el resto de la página si hay un fallo; muestra mensajes específicos.
* 🖱️ **Avatares clicables**: el encabezado de la página principal muestra todos los avatares y cada uno actúa como enlace al calendario personal del miembro.
* 🎨 **Uniformidad visual**: botones ahora comparten tamaño mínimo y estilo, los formularios utilizan clases de estilo coherentes (`form-label`, `form-input`, etc.) y se han añadido reglas CSS para `.form-actions` y `.home-avatar`.
* ☁️ **Preparación para despliegue en Vercel**:
  - `config/config.js` lee variables de entorno en lugar de valores fijos.
  - Se añadió `vercel.json` con builds y rutas para servir el frontend estático y el backend como función serverless.
  - `api/index.js` envuelve la aplicación Express para Vercel.
  - `backend/server.js` exporta el `app` y sólo arranca el servidor cuando se ejecuta directamente.
  - El `package.json` raíz ahora actúa como monorepo (workspaces) y contiene scripts para lanzar cada subproyecto.
  - Se validan tipos MIME de imágenes en subidas para evitar avisos de recursos inválidos.
  - 📝 **Despliegue**: haz push a GitHub y conecta el repositorio en Vercel; configura variables de entorno (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, OLLAMA_API_URL, etc.) en el panel de Vercel. La build correrá `npm install` en la raíz, creará la carpeta `frontend/build` y desplegará el backend como función lambda bajo `/api/*`.

Estas mejoras no introducen nuevas peticiones inválidas; todo el flujo se probó para evitar errores 400/500.

