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
        const memberId = req.params.memberId;
        if (isNaN(memberId)) {
            return res.status(400).json({ success: false, error: 'ID de miembro inválido' });
        }

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
            [memberId]
        );
        return res.json(rows);
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        // intentar crear o reparar la tabla si no existe y reintentar una vez
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('Tabla member_documents no existe, creando de forma automática');
            try {
                await pool.query(`
                    CREATE TABLE IF NOT EXISTS member_documents (
                      id INT PRIMARY KEY AUTO_INCREMENT,
                      member_id INT NOT NULL,
                      document_name VARCHAR(255) NOT NULL,
                      document_type VARCHAR(100),
                      file_data LONGBLOB,
                      file_size INT,
                      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
                      INDEX idx_member_id (member_id),
                      INDEX idx_upload_date (upload_date)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                `);
                const [rows2] = await pool.query(
                    `SELECT id, document_name, document_type, file_size, upload_date
                     FROM member_documents
                     WHERE member_id = ? ORDER BY upload_date DESC`,
                    [req.params.memberId]
                );
                return res.json(rows2);
            } catch (innerErr) {
                console.error('Error creando tabla member_documents:', innerErr);
            }
        }
        // corregir columnas faltantes (por migraciones anteriores)
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            const msg = error.message || '';
            console.log('Error de campo en member_documents:', msg);
            // si falta file_size o file_data la solución es añadir la columna
            try {
                if (msg.includes('file_size')) {
                    console.log('Agregando columna file_size automáticamente');
                    await pool.query('ALTER TABLE member_documents ADD COLUMN file_size INT');
                }
                if (msg.includes('file_data')) {
                    console.log('Agregando columna file_data automáticamente');
                    await pool.query('ALTER TABLE member_documents ADD COLUMN file_data LONGBLOB');
                }
                // reintentar la consulta original
                const [rows3] = await pool.query(
                    `SELECT id, document_name, document_type, file_size, upload_date
                     FROM member_documents
                     WHERE member_id = ? ORDER BY upload_date DESC`,
                    [req.params.memberId]
                );
                return res.json(rows3);
            } catch (fixErr) {
                console.error('Error reparando columnas de member_documents:', fixErr);
            }
        }
        // siempre devolver 200 con detalles
        return res.status(200).json({ error: 'Error al obtener documentos', details: error.message });
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
                'INSERT INTO member_documents (member_id, document_name, document_type, file_data, file_size) VALUES (?, ?, ?, ?, ?)',
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
            'SELECT document_name, document_type, file_data FROM member_documents WHERE id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const document = rows[0];
        res.setHeader('Content-Type', document.document_type);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.document_name)}"`);
        res.send(document.file_data);
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