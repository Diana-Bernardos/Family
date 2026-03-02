# Family Calendar App - Setup Guide

## Requisitos Previos

- Node.js 14+ instalado
- MySQL/MariaDB 5.7+ instalado y ejecutándose
- Ollama instalado y ejecutándose localmente
- npm o yarn como gestor de paquetes

## Instalación

### 1. Configurar Base de Datos

Ejecuta el script SQL para crear la base de datos:

```bash
mysql -u root -p < family.sql
```

Ingresa tu contraseña de MySQL cuando se te pida.

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd frontend
npm install
```

## Configuración

### Backend (.env)

El archivo `.env` ya debe tener esta configuración:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Dianaleire
DB_NAME=calendar_app
PORT=3001
OLLAMA_API_URL=http://localhost:11434/api
OLLAMA_MODEL=phi3:3.8b
NODE_ENV=development
```

### Ollama con Phi3

Para usar el asistente con Ollama Phi3:

1. Asegúrate de que Ollama está ejecutándose:
```bash
ollama serve
```

2. Descarga el modelo Phi3 (en otra terminal):
```bash
ollama pull phi3:3.8b
```

## Ejecución

### Opción 1: Ejecutar ambos servidores

#### Terminal 1 - Backend:
```bash
cd backend
npm start
```

El backend estará disponible en: `http://localhost:3001`

#### Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

El frontend estará disponible en: `http://localhost:3000`

### Opción 2: Modo desarrollo con nodemon (recomendado)

#### Para Backend:
```bash
cd backend
npm run dev
```

## Características

- ✅ Gestión de eventos familiares
- ✅ Gestión de miembros de la familia
- ✅ Almacenamiento en base de datos MySQL
- ✅ Asistente de IA con Ollama Phi3
- ✅ Chat contextual con información de la familia
- ✅ Sugerencias automáticas basadas en eventos

## Endpoints Principales

### Eventos
- `GET /api/events` - Obtener todos los eventos
- `GET /api/events/:id` - Obtener un evento específico
- `POST /api/events` - Crear nuevo evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Miembros
- `GET /api/members` - Obtener todos los miembros
- `GET /api/members/:id` - Obtener un miembro específico
- `POST /api/members` - Crear nuevo miembro
- `PUT /api/members/:id` - Actualizar miembro
- `DELETE /api/members/:id` - Eliminar miembro

### Asistente
- `POST /api/assistant/query` - Enviar mensaje al asistente
- `GET /api/assistant/context/:userId` - Obtener contexto
- `GET /api/assistant/suggestions/:userId` - Obtener sugerencias

## Solución de Problemas

### Error de conexión a BD
- Verifica que MySQL está ejecutándose
- Confirma credenciales en `.env`
- Verifica que la BD `calendar_app` existe

### Asistente no responde
- Verifica que Ollama está ejecutándose
- Confirma que el modelo `phi3:3.8b` está descargado
- Revisa la consola del backend para errores

### Puerto en uso
- Si el puerto 3001 está en uso, cambia en `.env`
- Si el puerto 3000 está en uso para frontend, React te pedirá usar otro

## Modelos Disponibles de Ollama

Puedes cambiar el modelo en `config/config.js`:

- `phi3:3.8b` (Recomendado - Rápido y eficiente)
- `phi3:14b` (Más preciso, más lento)
- `llama2:7b` (Alternativa)
- `neural-chat:7b` (Bueno para chat)

Para cambiar:
```bash
ollama pull nombre_del_modelo
# Actualiza OLLAMA_MODEL en .env
```

## Desarrollo

### Scripts disponibles

Backend:
```bash
npm start      # Ejecutar servidor
npm run dev    # Ejecutar con nodemon
npm test       # Ejecutar tests
```

Frontend:
```bash
npm start      # Ejecutar servidor de desarrollo
npm run build  # Construir para producción
npm test       # Ejecutar tests
```

## Notas Importantes

1. Asegúrate de ejecutar la BD directamente o usar MySQL Workbench
2. El asistente requiere que Ollama esté activo
3. Los datos se guardan automáticamente en la BD
4. Las imágenes y avatares se almacenan como BLOB en la BD

## Contacto y Soporte

Para reportar problemas o sugerencias, revisa los logs en la consola del servidor.
