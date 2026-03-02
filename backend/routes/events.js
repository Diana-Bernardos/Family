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
        const { name, event_date, event_type, icon, color, members } = req.body;

        // Validación básica
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'El nombre del evento es requerido' });
        }

        if (!event_date) {
            return res.status(400).json({ error: 'La fecha del evento es requerida' });
        }

        // Validar formato de fecha (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(event_date)) {
            return res.status(400).json({ error: 'Formato de fecha inválido (debe ser YYYY-MM-DD)' });
        }

        await connection.beginTransaction();

        let imageData = null;
        let imageType = null;

        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) { // 5MB max
                await connection.rollback();
                return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
            }
            if (!req.file.mimetype.startsWith('image/')) {
                await connection.rollback();
                return res.status(400).json({ error: 'Solo se permiten imágenes para el evento' });
            }
            imageData = req.file.buffer;
            imageType = req.file.mimetype;
        }

        const [eventResult] = await connection.query(
            'INSERT INTO events (name, event_date, event_type, icon, color, image_data, image_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name.trim(), event_date, event_type || null, icon || null, color || '#000000', imageData, imageType]
        );

        const eventId = eventResult.insertId;

        if (members) {
            const memberIds = Array.isArray(members) ? members : JSON.parse(members);
            for (const memberId of memberIds) {
                try {
                    await connection.query(
                        'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
                        [eventId, memberId]
                    );
                } catch (memberError) {
                    // Ignorar si el miembro no existe o ya está asignado
                    if (memberError.code !== 'ER_NO_REFERENCED_ROW_2' && memberError.code !== 'ER_DUP_ENTRY') {
                        throw memberError;
                    }
                }
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
            image: imageData && imageType && imageType.startsWith('image/') ? {
                data: imageData.toString('base64'),
                type: imageType
            } : null,
            members: members ? (Array.isArray(members) ? members : JSON.parse(members)) : []
        };

        res.status(201).json(response);
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Error al revertir transacción:', rollbackError);
        }
        console.error('Error en POST /events:', error);
        res.status(500).json({ error: 'Error al crear evento: ' + error.message });
    } finally {
        connection.release();
    }
});

// Actualizar evento
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, event_date, event_type, icon, color } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del evento requerido' });
        }

        let imageData = undefined;
        let imageType = undefined;

        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) { // 5MB max
                return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
            }
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Solo se permiten imágenes para el evento' });
            }
            imageData = req.file.buffer;
            imageType = req.file.mimetype;
        }

        let query = 'UPDATE events SET name = ?, event_date = ?, event_type = ?, icon = ?, color = ?';
        let params = [name, event_date, event_type, icon, color];

        if (imageData !== undefined) {
            query += ', image_data = ?, image_type = ?';
            params.push(imageData, imageType);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento actualizado exitosamente', id });
    } catch (error) {
        console.error('Error en PUT /events/:id:', error);
        res.status(500).json({ error: 'Error al actualizar evento: ' + error.message });
    }
});

// Eliminar evento
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID del evento requerido' });
        }

        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        res.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error('Error en DELETE /events/:id:', error);
        res.status(500).json({ error: 'Error al eliminar evento: ' + error.message });
    }
});

module.exports = router;