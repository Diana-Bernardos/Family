const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

// catch unhandled errors to prevent crashes and log them
process.on('unhandledRejection', (err) => {
    console.error('🔥 Unhandled Promise Rejection:', err);
});
process.on('uncaughtException', (err) => {
    console.error('🔥 Uncaught Exception:', err);
});

const config = require('./config/config');
const pool = require('./config/database');
const ChatService = require('./services/chatService');
const { initializeDatabase } = require('./utils/dbInit');

const app = express();

// exportamos app para entornos serverless (Vercel) o test

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3004', 'http://localhost:3005'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Ensure upload directories exist
const dirs = ['uploads', 'uploads/avatars', 'uploads/documents'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Routes
const membersRouter = require('./routes/members');
const eventsRouter = require('./routes/events');
const documentsRouter = require('./routes/documents');
const authRoutes = require('./routes/auth');
const assistantRouter = require('./routes/assistant');
const aiRouter = require('./routes/ai');

// API routes
app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRouter);
app.use('/api/ai', aiRouter);

// Chatbot endpoint
app.post('/api/assistant/query', async (req, res) => {
    const { query, userId } = req.body;
    
    try {
        if (!query || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Query y userId son requeridos'
            });
        }

        // Usar el servicio mejorado de ChatService
        const result = await ChatService.sendMessage(userId, query);
        
        res.json(result);
    } catch (error) {
        console.error('Error en el asistente:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar el mensaje',
            details: error.message
        });
    }
});

// Additional context endpoints
app.get('/api/assistant/context/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const context = await ChatService.getFullContext(userId);
        res.json({ success: true, data: context });
    } catch (error) {
        console.error('Error obteniendo contexto:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener contexto' 
        });
    }
});

app.get('/api/assistant/suggestions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const context = await ChatService.getFullContext(userId);
        const suggestions = await ChatService.generateSuggestions(context);
        res.json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Error obteniendo sugerencias:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error al obtener sugerencias' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error detallado:', err);
    // Para rutas críticas convertimos cualquier fallo a status 200 para que
    // el frontend no reciba 500 y pueda manejar el mensaje.
    if (req.path.startsWith('/api/ai') || req.path.startsWith('/api/documents')) {
        return res.status(200).json({
            success: false,
            error: 'Error interno del servidor',
            details: err.message
        });
    }

    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: err.message
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || config.PORT;

async function startServer() {
    try {
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('   Inicializando Family Calendar App');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        // Inicializar base de datos
        console.log('📦 Inicializando base de datos...');
        await initializeDatabase();
        
        console.log('\n✅ Base de datos lista');
        
        const server = app.listen(PORT, () => {
            console.log('✅ Servidor iniciado correctamente');
            console.log(`\n🌐 Backend: http://localhost:${PORT}`);
            console.log(`🌐 Frontend: http://localhost:3000`);
            console.log(`📚 API Docs: http://localhost:${PORT}/health`);
            console.log('\n═══════════════════════════════════════════════════════════\n');
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`\n✗ El puerto ${PORT} já está en uso`);
                process.exit(1);
            }
            throw error;
        });
    } catch (error) {
        console.error('\n✗ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Sólo arrancar si ejecutamos este archivo directamente (no cuando se importa en serverless)
if (require.main === module) {
    startServer();
}
