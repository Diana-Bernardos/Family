const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/database');

// Configuración de multer simplificada
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
}).single('document');

// Obtener documentos
router.get('/:memberId/documents', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT 
                id, 
                document_name, 
                document_type, 
                file_size,
                upload_date 
            FROM member_documents 
            WHERE member_id = ? 
            ORDER BY upload_date DESC`,
            [req.params.memberId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
});

// Subir documento
router.post('/:memberId/upload', (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: `Error en la subida: ${err.message}` });
        } else if (err) {
            return res.status(500).json({ error: 'Error al procesar el archivo' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
        }

        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [result] = await connection.query(
                'INSERT INTO member_documents (member_id, document_name, document_type, document_data, file_size) VALUES (?, ?, ?, ?, ?)',
                [
                    req.params.memberId,
                    req.file.originalname,
                    req.file.mimetype,
                    req.file.buffer,
                    req.file.size
                ]
            );

            await connection.commit();

            res.status(201).json({
                message: 'Documento subido exitosamente',
                file: {
                    id: result.insertId,
                    document_name: req.file.originalname,
                    document_type: req.file.mimetype,
                    file_size: req.file.size,
                    upload_date: new Date()
                }
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error al subir documento:', error);
            res.status(500).json({ error: 'Error al guardar el documento' });
        } finally {
            if (connection) connection.release();
        }
    });
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
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.document_name)}"`);
        res.send(document.document_data);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar documento' });
    }
});

// Eliminar documento
router.delete('/:id', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [document] = await connection.query(
            'SELECT id, document_name FROM member_documents WHERE id = ?',
            [req.params.id]
        );

        if (document.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        await connection.query(
            'DELETE FROM member_documents WHERE id = ?',
            [req.params.id]
        );

        await connection.commit();
        res.json({ 
            message: 'Documento eliminado exitosamente',
            deletedDocument: {
                id: req.params.id,
                name: document[0].document_name
            }
        });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error al eliminar documento:', error);
        res.status(500).json({ error: 'Error al eliminar documento' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;