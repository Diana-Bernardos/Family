// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const fs = require('fs');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));


// Importar rutas
const membersRouter = require('./routes/members');
const eventsRouter = require('./routes/events');
const documentsRouter = require('./routes/documents');

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


// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});