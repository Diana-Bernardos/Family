const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener eventos próximos
router.get('/events/upcoming/:userId', async (req, res) => {
    try {
        const [events] = await pool.query(
            `SELECT * FROM events 
             WHERE user_id = ? AND date >= CURDATE()
             ORDER BY date ASC LIMIT 10`,
            [req.params.userId]
        );
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Obtener documentos próximos a vencer
router.get('/documents/expiring/:userId', async (req, res) => {
    try {
        const [documents] = await pool.query(
            `SELECT * FROM documents 
             WHERE user_id = ? AND expiry_date IS NOT NULL
             AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
             ORDER BY expiry_date ASC`,
            [req.params.userId]
        );
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});

// Crear tarea
router.post('/tasks', async (req, res) => {
    try {
        const { userId, title, description, dueDate } = req.body;
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)',
            [userId, title, description, dueDate]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear tarea' });
    }
});

// Obtener recomendaciones
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { type } = req.query;
        const [recommendations] = await pool.query(
            `SELECT * FROM recommendations 
             WHERE user_id = ? AND type = ?
             ORDER BY RAND() LIMIT 5`,
            [req.params.userId, type]
        );
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener recomendaciones' });
    }
});

module.exports = router;