const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Obtener contexto completo para el asistente
router.get('/context/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Obtener todos los datos relevantes en paralelo
        const [events, members, documents] = await Promise.all([
            pool.query(
                `SELECT * FROM events 
                WHERE member_id IN (
                    SELECT id FROM members WHERE user_id = ?
                ) AND event_date >= CURDATE()
                ORDER BY event_date ASC`,
                [userId]
            ),
            pool.query(
                'SELECT * FROM members WHERE user_id = ?',
                [userId]
            ),
            pool.query(
                'SELECT * FROM member_documents WHERE member_id IN (SELECT id FROM members WHERE user_id = ?)',
                [userId]
            )
        ]);

        res.json({
            events: events[0],
            members: members[0],
            documents: documents[0]
        });
    } catch (error) {
        console.error('Error getting context:', error);
        res.status(500).json({ error: 'Error getting context' });
    }
});

// Procesar consulta del asistente
router.post('/query', async (req, res) => {
    try {
        const { userId, query, type } = req.body;
        let response;

        switch (type) {
            case 'calendar':
                response = await processCalendarQuery(userId, query);
                break;
            case 'members':
                response = await processMemberQuery(userId, query);
                break;
            case 'documents':
                response = await processDocumentQuery(userId, query);
                break;
            default:
                response = await processGeneralQuery(userId, query);
        }

        res.json(response);
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Error processing query' });
    }
});

// Funciones auxiliares para procesar consultas
async function processCalendarQuery(userId, query) {
    const [events] = await pool.query(
        `SELECT e.*, m.name as member_name 
        FROM events e 
        JOIN members m ON e.member_id = m.id 
        WHERE m.user_id = ? AND e.event_date >= CURDATE()
        ORDER BY e.event_date ASC`,
        [userId]
    );
    
    return {
        type: 'calendar',
        data: events,
        message: formatCalendarResponse(events, query)
    };
}

async function processMemberQuery(userId, query) {
    const [members] = await pool.query(
        `SELECT m.*, 
        (SELECT COUNT(*) FROM events e WHERE e.member_id = m.id AND e.event_date >= CURDATE()) as upcoming_events,
        (SELECT COUNT(*) FROM member_documents md WHERE md.member_id = m.id) as document_count
        FROM members m
        WHERE m.user_id = ?`,
        [userId]
    );

    return {
        type: 'members',
        data: members,
        message: formatMemberResponse(members, query)
    };
}

async function processDocumentQuery(userId, query) {
    const [documents] = await pool.query(
        `SELECT md.*, m.name as member_name 
        FROM member_documents md
        JOIN members m ON md.member_id = m.id
        WHERE m.user_id = ?
        ORDER BY md.upload_date DESC`,
        [userId]
    );

    return {
        type: 'documents',
        data: documents,
        message: formatDocumentResponse(documents, query)
    };
}

// Funciones de formateo
function formatCalendarResponse(events, query) {
    // Lógica para formatear respuesta de calendario
    return `Encontré ${events.length} eventos próximos.`;
}

function formatMemberResponse(members, query) {
    // Lógica para formatear respuesta de miembros
    return `Hay ${members.length} miembros en tu familia.`;
}

function formatDocumentResponse(documents, query) {
    // Lógica para formatear respuesta de documentos
    return `Tienes ${documents.length} documentos almacenados.`;
}

module.exports = router;