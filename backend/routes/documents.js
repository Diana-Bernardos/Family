// backend/routes/documents.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/database');

// Configuración de multer para almacenar en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'));
        }
    }
});

// Obtener documentos de un miembro
router.get('/:memberId/documents', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, document_name, document_type, upload_date FROM member_documents WHERE member_id = ?',
            [req.params.memberId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});

// Subir documento
router.post('/:memberId/upload', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { memberId } = req.params;
        const documentName = req.file.originalname;
        const documentType = req.file.mimetype;
        const documentData = req.file.buffer;

        const [result] = await connection.query(
            'INSERT INTO member_documents (member_id, document_name, document_type, document_data) VALUES (?, ?, ?, ?)',
            [memberId, documentName, documentType, documentData]
        );

        await connection.commit();

        res.status(201).json({
            id: result.insertId,
            document_name: documentName,
            document_type: documentType,
            upload_date: new Date()
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al subir documento:', error);
        res.status(500).json({ error: 'Error al subir documento' });
    } finally {
        connection.release();
    }
});

// Descargar documento
router.get('/download/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT document_name, document_type, document_data FROM member_documents WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const document = rows[0];
        res.setHeader('Content-Type', document.document_type);
        res.setHeader('Content-Disposition', `attachment; filename="${document.document_name}"`);
        res.send(document.document_data);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar documento' });
    }
});

// Eliminar documento
router.delete('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.query(
            'DELETE FROM member_documents WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Documento no encontrado');
        }

        await connection.commit();
        res.json({ message: 'Documento eliminado exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar documento:', error);
        res.status(500).json({ error: 'Error al eliminar documento' });
    } finally {
        connection.release();
    }
});

module.exports = router;