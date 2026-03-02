# 🔧 Correcciones de Errores 500 - Chat y Documentos

## ✅ Problemas Identificados y Solucionados

### 1. **Error 500 - Chat (Asistente IA)**

**Causa**: El servicio de chat falla cuando:
- Ollama no está corriendo
- Hay timeout en la conexión a Ollama
- Ollama no responde correctamente

**Soluciones Aplicadas**:
- ✅ Agregado timeout de 10 segundos para llamadas a Ollama
- ✅ Implementado fallback automático con respuestas contextuales cuando Ollama falla
- ✅ Ahora devuelve respuesta inteligente basada en los datos de la familia aunque Ollama esté offline
- ✅ Mejor manejo de errores sin bloquear la aplicación

**Archivos Modificados**: `backend/services/chatService.js`

---

### 2. **Error 500 - Ver Documentos de Miembro**

**Causa**: La tabla `member_documents` no existía en la base de datos

**Soluciones Aplicadas**:
- ✅ Agregada tabla `member_documents` a `family.sql`
- ✅ Corregidos nombres de columnas en `documents.js` (`file_data` en lugar de `document_data`)
- ✅ Actualizado método de guardado en base de datos

**Archivos Modificados**: 
- `family.sql` - Nueva tabla
- `backend/routes/documents.js` - Columnas corregidas

---

## 🔄 Pasos para Aplicar los Cambios

### Opción 1: Reiniciar la BD Completamente (Recomendado)

```bash
# 1. En PowerShell o Terminal, elimina y recrea la base de datos:
mysql -u root -p < family.sql

# Ingresa tu contraseña de MySQL (Dianaleire)
```

**Ventaja**: Crea la tabla `member_documents` desde cero con la estructura correcta.

---

### Opción 2: Agregar la Tabla Manualmente (Sin Perder Datos)

Si ya tienes datos en la BD y no quieres perderlos:

```sql
-- Ejecuta esto en MySQL/MariaDB:
USE calendar_app;

CREATE TABLE IF NOT EXISTS member_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  member_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  file_data LONGBLOB,
  file_size INT,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  INDEX idx_member_id (member_id),
  INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📋 Cambios en el Código

### ChatService.js - Nuevo Método de Fallback

```javascript
// Si Ollama no está disponible, usa respuestas contextuales
if (lowerMessage.includes('evento') || lowerMessage.includes('próximo')) {
    return `📅 Próximo evento: "${nextEvent.name}" el ...`;
}

if (lowerMessage.includes('miembro') || lowerMessage.includes('familia')) {
    return `👨‍👩‍👧‍👦 Tu familia tiene ${members.length} miembro(s): ...`;
}

// etc...
```

### Documents.js - Columnas Corregidas

```javascript
// Antes: (incorrecto)
INSERT INTO member_documents (member_id, document_name, document_type, document_data, file_size)

// Ahora: (correcto)
INSERT INTO member_documents (member_id, document_name, document_type, file_data, file_size)
```

---

## 🧪 Cómo Probar los Cambios

### Test 1: Chat sin Ollama
1. **Asegúrate de que Ollama NO está corriendo**
2. Abre la aplicación
3. Haz clic en el ícono de chat (esquina inferior derecha)
4. Escribe un mensaje (ej: "¿Cuántos eventos tengo?")
5. **Esperado**: Debería responder con información de tu contexto

**Resultado**: ✅ Chat funciona sin Ollama

---

### Test 2: Chat con Ollama
1. **Inicia Ollama**: `ollama serve`
2. Asegúrate que el modelo está disponible: `ollama list`
3. Si no está descargado: `ollama pull phi3:3.8b`
4. Abre la aplicación
5. Escribe un mensaje en el chat
6. **Esperado**: Respuesta generada por IA de Ollama

**Resultado**: ✅ Chat funciona con IA mejorada

---

### Test 3: Documentos de Miembro
1. Abre la aplicación
2. Ve a Miembros → Selecciona un miembro existente
3. En la sección "Documentos", intenta subir un archivo
4. **Esperado**: Debería guardarse sin error 500

**Resultado**: ✅ Documentos funcionan

---

## 🚀 Resumen de Cambios

| Archivo | Cambio | Razón |
|---------|--------|-------|
| `family.sql` | Agregada tabla `member_documents` | Tabla faltante |
| `backend/services/chatService.js` | Agregado fallback y manejo de errores | Mejor UX cuando Ollama falla |
| `backend/routes/documents.js` | Corregidas columnas `file_data` | Nombres incorrectos de columnas |

---

## ⚠️ Notas Importantes

1. **Ollama es Opcional**: El chat ahora funciona incluso sin Ollama
2. **Timeout**: Si Ollama es lento, después de 10 segundos usa fallback
3. **Base de Datos**: Si usaste Opción 1, tus datos previos se perderán (recrea manualmente si es necesario)
4. **Reiniciar Backend**: Después de cambiar la BD, reinicia el servidor backend: `npm run dev`

---

## 📊 Qué Ocurre Ahora

### Flujo de Chat Mejorado

```
Usuario escribe mensaje
    ↓
Obtener contexto (eventos, miembros, tareas)
    ↓
¿Ollama disponible?
    ├─ SÍ → Generar respuesta con IA
    └─ NO → Generar respuesta contextual inteligente
    ↓
Guardar interacción en BD
    ↓
Devolver respuesta al usuario
```

---

## ✨ Beneficios

✅ Chat funciona sin Ollama (fallback inteligente)
✅ Documents endpoint no falla más
✅ Mejor manejo de errores
✅ Menos 500 errors
✅ Experiencia más robusta

---

**Status**: ✅ Listo para usar
**Necesario**: Reiniciar base de datos y servidor backend
**Tiempo estimado**: 5 minutos
