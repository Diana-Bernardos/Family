const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const config = require('./config/config');
const pool = require('./config/database');

const app = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const dirs = ['uploads', 'uploads/avatars', 'uploads/documents'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const membersRouter = require('./routes/members');
const eventsRouter = require('./routes/events');
const documentsRouter = require('./routes/documents');
const authRoutes = require('./routes/auth');
const assistantRouter = require('./routes/assistant');
const aiRouter = require('./routes/ai');

app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRouter);
app.use('/api/ai', aiRouter);

app.post('/api/assistant/query', async (req, res) => {
    const { query } = req.body;
    
    try {
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: query,
            stream: false,
            options: {
                temperature: 0.7,
                top_k: 50,
                top_p: 0.95,
                num_ctx: 2048,
                repeat_penalty: 1.1
            }
        });
        
        res.json({
            response: response.data.response || 'No se pudo generar una respuesta.'
        });
    } catch (error) {
        console.error('Error al llamar a Ollama:', error.response ? error.response.data : error.message);
        res.status(500).json({
            response: 'Error al procesar el mensaje',
            error: error.message
        });
    }
});

app.use((err, req, res, next) => {
    console.error('Error detallado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

const PORT = process.env.PORT || config.PORT;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;