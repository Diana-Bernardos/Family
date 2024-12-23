const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();

// conf cors
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));


// Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Importar rutas
const membersRouter = require('./routes/members');
const eventsRouter = require('./routes/events');
const documentsRouter = require('./routes/documents');
const authRoutes = require('./routes/auth');
const assistantRouter = require('./routes/assistant');

// Crear directorios necesarios
const dirs = ['uploads', 'uploads/avatars', 'uploads/documents'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});


// Usar rutas
app.use('/api/members', membersRouter);
app.use('/api/events', eventsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/assistant', assistantRouter);


// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detallado:', err);
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            error: 'Error en la subida de archivo',
            details: err.message
        });
    }
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = server; 