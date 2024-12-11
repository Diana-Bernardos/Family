// routes/events.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');

// Configuración de multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, name, event_date, event_type, icon, color, image_data, image_type 
            FROM events
        `);

        const events = rows.map(event => ({
            ...event,
            image: event.image_data ? {
                data: event.image_data.toString('base64'),
                type: event.image_type
            } : null
        }));

        events.forEach(event => {
            delete event.image_data;
            delete event.image_type;
        });

        res.json(events);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Obtener un evento específico
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, event_date, event_type, icon, color, image_data, image_type FROM events WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        const event = rows[0];
        const response = {
            ...event,
            image: event.image_data ? {
                data: event.image_data.toString('base64'),
                type: event.image_type
            } : null
        };
        delete response.image_data;
        delete response.image_type;

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener evento' });
    }
});


// Crear nuevo evento
router.post('/', upload.single('image'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { name, event_date, event_type, icon, color, members } = req.body;
        let imageData = null;
        let imageType = null;

        if (req.file) {
            imageData = req.file.buffer;
            imageType = req.file.mimetype;
        }

        const [eventResult] = await connection.query(
            'INSERT INTO events (name, event_date, event_type, icon, color, image_data, image_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, event_date, event_type, icon, color, imageData, imageType]
        );

        const eventId = eventResult.insertId;

        if (members) {
            const memberIds = JSON.parse(members);
            for (const memberId of memberIds) {
                await connection.query(
                    'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
                    [eventId, memberId]
                );
            }
        }

        await connection.commit();

        const response = {
            id: eventId,
            name,
            event_date,
            event_type,
            icon,
            color,
            image: imageData ? {
                data: imageData.toString('base64'),
                type: imageType
            } : null,
            members: members ? JSON.parse(members) : []
        };

        res.status(201).json(response);
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al crear evento' });
    } finally {
        connection.release();
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