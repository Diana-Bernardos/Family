const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const config = require('./config/config');
const pool = require('./config/database');
const ChatService = require('./services/chatService');

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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
        // Get context for the chat
        const context = await ChatService.getFullContext(userId);
        
        // Create prompt with context
        const prompt = ChatService.createPrompt(query, context);

        // Call Ollama
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.3, // Reducido para respuestas más precisas
                top_k: 10,
                top_p: 0.9,
                num_ctx: 2048,
                repeat_penalty: 1.2
            }
        });

        // Generate suggestions
        const suggestions = await ChatService.generateSuggestions(context);

        // Save interaction
        await ChatService.saveInteraction(
            userId, 
            query, 
            response.data.response, 
            context, 
            'query'
        );
        
        res.json({
            success: true,
            response: response.data.response,
            context: context,
            suggestions: suggestions
        });
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
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: err.message
    });
});

// Start server
const PORT = process.env.PORT || config.PORT;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

module.exports = server;