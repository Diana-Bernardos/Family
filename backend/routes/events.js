// routes/events.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
});

// Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events ORDER BY event_date');
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un evento específico
router.get('/:id', async (req, res) => {
    try {
        const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (events.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json(events[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear nuevo evento
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, event_date, event_type, icon, color } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await pool.query(
            'INSERT INTO events (name, event_date, event_type, icon, color, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, event_date, event_type, icon, color, image_url]
        );

        res.status(201).json({
            id: result.insertId,
            name,
            event_date,
            event_type,
            icon,
            color,
            image_url
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar evento
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, event_date, event_type, icon, color } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;

        let query = 'UPDATE events SET name = ?, event_date = ?, event_type = ?, icon = ?, color = ?';
        let params = [name, event_date, event_type, icon, color];

        if (image_url) {
            query += ', image_url = ?';
            params.push(image_url);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar evento
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;