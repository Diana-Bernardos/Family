const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const config = require('./config/config');
const pool = require('./config/database');

const app = express();

// CORS Options
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create necessary directories
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

app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRouter);
app.use('/api/ai', aiRouter);

// Ollama Assistant Endpoint
app.post('/api/assistant/query', async (req, res) => {
    // Existing code
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Existing code
});

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = server;