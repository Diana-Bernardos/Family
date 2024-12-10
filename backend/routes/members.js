const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const pool = require('../config/database');



// Configuración de la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'tu_contraseña',
    database: process.env.DB_NAME || 'calendar_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars/');
    },
    filename: (req, file, cb) => {
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Obtener eventos de un miembro específico
router.get('/:id/events', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.*
            FROM events e
            INNER JOIN event_members em ON e.id = em.event_id
            WHERE em.member_id = ?
            ORDER BY e.event_date DESC
        `, [req.params.id]);

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener eventos del miembro:', error);
        res.status(500).json({ error: 'Error al obtener eventos del miembro' });
    }
});

// Obtener un miembro específico
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener miembro:', error);
        res.status(500).json({ error: 'Error al obtener miembro' });
    }
});

// Obtener todos los miembros
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM members ORDER BY name');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener miembros:', error);
        res.status(500).json({ error: 'Error al obtener miembros' });
    }
});

// Obtener un miembro específico con sus eventos
router.get('/:id', async (req, res) => {
    try {
        const [members] = await pool.query(`
            SELECT m.*, 
                   GROUP_CONCAT(e.id) as event_ids,
                   GROUP_CONCAT(e.name) as event_names
            FROM members m
            LEFT JOIN event_members em ON m.id = em.member_id
            LEFT JOIN events e ON em.event_id = e.id
            WHERE m.id = ?
            GROUP BY m.id
        `, [req.params.id]);

        if (members.length === 0) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        const member = members[0];
        const formattedMember = {
            ...member,
            events: member.event_ids ? 
                member.event_ids.split(',').map((id, index) => ({
                    id,
                    name: member.event_names.split(',')[index]
                })) : []
        };

        res.json(formattedMember);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo miembro
router.post('/', upload.single('avatar'), async (req, res) => {
    const connection = await pool.getConnection();
    try {
        console.log('Datos recibidos:', req.body); // Log para debugging
        await connection.beginTransaction();

        const { name, email, phone, birth_date } = req.body;
        const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        // Validación básica
        if (!name || !email) {
            throw new Error('Nombre y email son requeridos');
        }

        const [result] = await connection.query(
            'INSERT INTO members (name, email, phone, birth_date, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone || null, birth_date || null, avatar_url]
        );

        await connection.commit();
        console.log('Miembro creado:', result); // Log para debugging

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            phone,
            birth_date,
            avatar_url
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear miembro:', error);
        res.status(500).json({ 
            error: 'Error al crear miembro',
            details: error.message 
        });
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
        const avatar_url = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        let query = 'UPDATE members SET name = ?, email = ?, phone = ?, birth_date = ?';
        let params = [name, email, phone, birth_date];

        if (avatar_url) {
            query += ', avatar_url = ?';
            params.push(avatar_url);
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
        res.status(500).json({ error: 'Error interno del servidor' });
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
router.get('/:id/events', async (req, res) => {
    try {
        const [events] = await pool.query(`
            SELECT e.*, em.member_id
            FROM events e
            INNER JOIN event_members em ON e.id = em.event_id
            WHERE em.member_id = ?
            ORDER BY e.event_date DESC
        `, [req.params.id]);

        if (!events) {
            return res.json([]);
        }

        res.json(events);
    } catch (error) {
        console.error('Error al obtener eventos del miembro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;