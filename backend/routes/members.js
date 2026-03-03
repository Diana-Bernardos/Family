const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/database'); // use shared pool

// Configuración de multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obtener eventos de un miembro específico
router.get('/:id/events', async (req, res) => {
    try {
        const [events] = await pool.query(`
            SELECT e.*, em.member_id
            FROM events e
            INNER JOIN event_members em ON e.id = em.event_id
            WHERE em.member_id = ?
            ORDER BY e.event_date DESC
        `, [req.params.id]);

        res.json(events || []);
    } catch (error) {
        console.error('Error al obtener eventos del miembro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener todos los miembros
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, phone, birth_date, avatar_data, avatar_type FROM members');
        
        const members = rows.map(member => ({
            ...member,
            avatar: member.avatar_data && member.avatar_type && member.avatar_type.startsWith('image/') ? {
                data: member.avatar_data.toString('base64'),
                type: member.avatar_type
            } : null
        }));
        members.forEach(member => {
            delete member.avatar_data;
            delete member.avatar_type;
        });

        res.json(members);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener miembros' });
    }
});

// Obtener un miembro específico
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, birth_date, avatar_data, avatar_type FROM members WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        const member = rows[0];
        const response = {
            ...member,
            avatar: member.avatar_data && member.avatar_type && member.avatar_type.startsWith('image/') ? {
                data: member.avatar_data.toString('base64'),
                type: member.avatar_type
            } : null
        };
        delete response.avatar_data;
        delete response.avatar_type;

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener miembro' });
    }
});

// Crear nuevo miembro
router.post('/', upload.single('avatar'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { name, email, phone, birth_date } = req.body;

        // Validación básica
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'El nombre del miembro es requerido' });
        }

        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ error: 'El email no es válido' });
        }

        await connection.beginTransaction();

        let avatarData = null;
        let avatarType = null;

        if (req.file) {
            if (req.file.size > 5 * 1024 * 1024) { // 5MB max
                await connection.rollback();
                return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
            }
            if (!req.file.mimetype.startsWith('image/')) {
                await connection.rollback();
                return res.status(400).json({ error: 'Solo se permiten imágenes para el avatar' });
            }
            avatarData = req.file.buffer;
            avatarType = req.file.mimetype;
        }

        const [result] = await connection.query(
            'INSERT INTO members (name, email, phone, birth_date, avatar_data, avatar_type) VALUES (?, ?, ?, ?, ?, ?)',
            [name.trim(), email || null, phone || null, birth_date || null, avatarData, avatarType]
        );

        await connection.commit();

        const response = {
            id: result.insertId,
            name: name.trim(),
            email: email || null,
            phone: phone || null,
            birth_date: birth_date || null,
            avatar: avatarData ? {
                data: avatarData.toString('base64'),
                type: avatarType
            } : null
        };

        res.status(201).json(response);
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Error al revertir transacción:', rollbackError);
        }
        console.error('Error en POST /members:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'El email ya existe' });
        }
        
        res.status(500).json({ error: 'Error al crear miembro: ' + error.message });
    } finally {
        connection.release();
    }
});

// Actualizar miembro
router.put('/:id', upload.single('avatar'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { id } = req.params;
        const { name, email, phone, birth_date } = req.body;
        let avatarData = null;
        let avatarType = null;

        if (req.file) {
            avatarData = req.file.buffer;
            avatarType = req.file.mimetype;
        }

        let query = 'UPDATE members SET name = ?, email = ?, phone = ?, birth_date = ?';
        let params = [name, email || null, phone || null, birth_date || null];

        if (req.file) {
            query += ', avatar_data = ?, avatar_type = ?';
            params.push(avatarData, avatarType);
        }

        query += ' WHERE id = ?';
        params.push(id);

        const [result] = await connection.query(query, params);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Miembro actualizado exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar miembro' });
    } finally {
        connection.release();
    }
});

// Eliminar miembro
router.delete('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query('DELETE FROM members WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        await connection.commit();
        res.json({ message: 'Miembro eliminado exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
});

module.exports = router;