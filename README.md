# 🏠 Family Calendar App

Una aplicación web para organizar eventos familiares con inteligencia artificial integrada.

## ✨ Características

- 📅 **Gestión de Eventos** - Crea, edita y elimina eventos familiares
- 👥 **Gestión de Miembros** - Administra los miembros de la familia
- 🤖 **Asistente con IA** - Chatbot alimentado por Ollama Phi3 para sugerencias inteligentes
- 💾 **Base de Datos MySQL** - Almacenamiento persistente de todos los datos
- 🎨 **Interfaz Moderna** - Frontend con React y Tailwind CSS
- 🔐 **Autenticación** - Sistema de login y registro (JWT)
- 📱 **Responsive Design** - Compatible con dispositivos móviles

## 📋 Requisitos Previos

- **Node.js** 14 o superior ([Descargar](https://nodejs.org/))
- **MySQL** 5.7 o superior ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Ollama** ([Descargar](https://ollama.ai/))
- **Git** (opcional, para clonar el repositorio)

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Windows)

```bash
setup.bat
```

### Opción 2: Script Automático (Mac/Linux)

```bash
chmod +x setup.sh
./setup.sh
```

### Opción 3: Instalación Manual

#### 1. Instalar dependencias del backend
```bash
cd backend
npm install
cd ..
```

#### 2. Instalar dependencias del frontend
```bash
cd frontend
npm install
cd ..
```

#### 3. Configurar Ollama con Phi3

##### En una terminal:
```bash
ollama serve
```

##### En otra terminal:
```bash
ollama pull phi3:3.8b
```

## ⚙️ Configuración

### 1. Base de Datos MySQL

#### Windows/PowerShell:
```powershell
mysql -u root -p < family.sql
```

#### Mac/Linux:
```bash
mysql -u root -p < family.sql
```

Ingresa tu contraseña de MySQL (en el proyecto: `Dianaleire`)

### 2. Variables de Entorno

El archivo `backend/.env` ya está configurado:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Dianaleire
DB_NAME=calendar_app
PORT=3001
OLLAMA_API_URL=http://localhost:11434/api
OLLAMA_MODEL=phi3:3.8b
JWT_SECRET=f5eaa967e2c89b8b9d5cc724f14c986a8f7569526a7c1bfd4acb70f9c5c6228c
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## ▶️ Ejecución

### Terminal 1: Backend

```bash
cd backend
npm start
```

Esperado:
```
═══════════════════════════════════════════════════════════
   Inicializando Family Calendar App
═══════════════════════════════════════════════════════════

📦 Inicializando base de datos...
✓ Conectado a MySQL
✓ Base de datos inicializada correctamente
✓ Tablas creadas: members, events, event_members, ...

✅ Base de datos lista
✅ Servidor iniciado correctamente

🌐 Backend: http://localhost:3001
🌐 Frontend: http://localhost:3000
```

### Terminal 2: Frontend

```bash
cd frontend
npm start
```

El navegador se abrirá automáticamente en `http://localhost:3000`

## 📡 API Endpoints

### Eventos

```bash
# Obtener todos los eventos
GET /api/events

# Obtener un evento específico
GET /api/events/:id

# Crear nuevo evento
POST /api/events
Content-Type: multipart/form-data
{
  name: "Cumpleaños de María",
  event_date: "2026-03-15",
  event_type: "birthday",
  icon: "🎂",
  color: "#FF69B4",
  members: [1, 2, 3]
}

# Actualizar evento
PUT /api/events/:id

# Eliminar evento
DELETE /api/events/:id
```

### Miembros

```bash
# Obtener todos los miembros
GET /api/members

# Obtener un miembro específico
GET /api/members/:id

# Crear nuevo miembro
POST /api/members
Content-Type: multipart/form-data
{
  name: "María García",
  email: "maria@example.com",
  phone: "123456789",
  birth_date: "1990-05-20"
}

# Actualizar miembro
PUT /api/members/:id

# Eliminar miembro
DELETE /api/members/:id

# Obtener eventos de un miembro
GET /api/members/:id/events
```

### Asistente (IA)

```bash
# Enviar mensaje al asistente
POST /api/assistant/query
{
  query: "¿Cuándo es el próximo evento?",
  userId: 1
}

# Obtener contexto
GET /api/assistant/context/:userId

# Obtener sugerencias
GET /api/assistant/suggestions/:userId
```

## 🗂️ Estructura del Proyecto

```
Family/
├── backend/
│   ├── config/
│   │   ├── config.js          # Configuración principal
│   │   └── database.js        # Conexión MySQL
│   ├── controllers/
│   │   └── eventController.js # Lógica de eventos
│   ├── middleware/
│   │   ├── auth.js            # Autenticación
│   │   ├── errorHandler.js    # Manejo de errores
│   │   └── validators.js      # Validaciones
│   ├── routes/
│   │   ├── events.js          # Rutas de eventos
│   │   ├── members.js         # Rutas de miembros
│   │   ├── auth.js            # Rutas de autenticación
│   │   ├── assistant.js       # Rutas del asistente
│   │   └── ai.js              # Rutas de IA
│   ├── services/
│   │   ├── chatService.js     # Servicio de chat/IA
│   │   ├── actionService.js   # Servicio de acciones
│   │   └── contextService.js  # Servicio de contexto
│   ├── utils/
│   │   └── dbInit.js          # Inicialización de BD
│   ├── .env                   # Variables de entorno
│   ├── package.json           # Dependencias
│   └── server.js              # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── context/           # Context API
│   │   ├── services/          # Servicios (API)
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilidades
│   │   ├── styles/            # Estilos CSS
│   │   ├── App.jsx            # Componente raíz
│   │   └── index.js           # Punto de entrada
│   ├── public/                # Archivos estáticos
│   └── package.json           # Dependencias
├── family.sql                 # Script de BD
├── SETUP_GUIDE.md            # Guía de instalación
└── README.md                  # Este archivo
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'mysql2'"
```bash
cd backend
npm install mysql2
```

### Error: "Port 3001 is already in use"
Cambia el puerto en `backend/.env`:
```env
PORT=3002
```

### Error: "Connection refused to 127.0.0.1:3306"
- Verifica que MySQL está corriendo
- En Windows: Abre Services y busca MySQL80
- En Mac: `brew services start mysql`
- En Linux: `sudo systemctl start mysql`

### El asistente no responde
- Verifica que Ollama está corriendo: `ollama serve`
- Verifica que descargaste el modelo: `ollama pull phi3:3.8b`
- Revisa los logs del backend para errores de conexión

### Error de CORS
El backend ya está configurado para aceptar requests desde el frontend. Si persiste:
1. Verifica que el frontend está en `http://localhost:3000`
2. Revisa la configuración en `server.js` línea 15-20

## 📚 Documentación Adicional

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Guía detallada de instalación
- [Documentación de Ollama](https://ollama.ai/library)
- [Documentación de React](https://react.dev)
- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios mayores:
1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/mejora`
3. Commit tus cambios: `git commit -m 'Agregar mejora'`
4. Push a la rama: `git push origin feature/mejora`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo LICENSE para más detalles.

## 📞 Soporte

Si encuentras un problema:
1. Revisa la sección de "Solución de Problemas"
2. Consulta los logs en la consola del servidor
3. Verifica que todos los servicios (MySQL, Ollama) están ejecutándose
4. Abre un issue en el repositorio

---

Hecho con ❤️ para gestionar mejor a tu familia
