// routes/assistantRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const unifiedAssistantService = require('../services/unifiedAssistantService');

// Obtener contexto completo para el asistente
router.get('/context/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const [
            [events],
            [members],
            [documents],
            [reminders],
            [recentHistory]
        ] = await Promise.all([
            pool.execute(
                `SELECT e.*, GROUP_CONCAT(m.name) as participants 
                 FROM events e 
                 LEFT JOIN event_members em ON e.id = em.event_id 
                 LEFT JOIN members m ON em.member_id = m.id 
                 WHERE e.event_date >= CURDATE() 
                 GROUP BY e.id 
                 ORDER BY e.event_date`,
                [userId]
            ),
            pool.execute(
                'SELECT * FROM members WHERE user_id = ?',
                [userId]
            ),
            pool.execute(
                'SELECT * FROM member_documents WHERE member_id IN (SELECT id FROM members WHERE user_id = ?)',
                [userId]
            ),
            pool.execute(
                'SELECT * FROM reminders WHERE user_id = ? AND status = "active"',
                [userId]
            ),
            pool.execute(
                'SELECT * FROM assistant_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
                [userId]
            )
        ]);

        res.json({
            events,
            members,
            documents,
            reminders,
            recentHistory
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
        
        // Usar el UnifiedAssistantService para procesar la consulta
        const assistantResponse = await unifiedAssistantService.processQuery(query, userId);

        // Procesar consultas específicas según el tipo
        let additionalData = {};
        switch (type) {
            case 'calendar':
                additionalData = await processCalendarQuery(userId, query);
                break;
            case 'members':
                additionalData = await processMemberQuery(userId, query);
                break;
            case 'documents':
                additionalData = await processDocumentQuery(userId, query);
                break;
        }

        res.json({
            ...assistantResponse,
            additionalData
        });
    } catch (error) {
        console.error('Error processing query:', error);
        res.status(500).json({ error: 'Error processing query' });
    }
});

// Ruta para obtener historial de chat
router.get('/history/:userId', async (req, res) => {
    try {
        const [history] = await pool.execute(
            `SELECT ah.*, 
             CASE 
                WHEN ah.query_type = 'event' THEN 
                    (SELECT COUNT(*) FROM events WHERE id = ah.reference_id)
                WHEN ah.query_type = 'document' THEN 
                    (SELECT COUNT(*) FROM member_documents WHERE id = ah.reference_id)
                ELSE 0
             END as has_reference
             FROM assistant_history ah
             WHERE ah.user_id = ? 
             ORDER BY ah.created_at DESC 
             LIMIT 50`,
            [req.params.userId]
        );
        res.json(history);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: 'Error getting history' });
    }
});

// Ruta para obtener sugerencias personalizadas
router.get('/suggestions/:userId', async (req, res) => {
    try {
        const [suggestions] = await pool.execute(
            `SELECT * FROM assistant_suggestions 
             WHERE user_id = ? 
             ORDER BY used_count DESC, last_used DESC 
             LIMIT 5`,
            [req.params.userId]
        );
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ error: 'Error getting suggestions' });
    }
});

// Funciones auxiliares para procesar consultas específicas
async function processCalendarQuery(userId, query) {
    const [events] = await pool.execute(
        `SELECT e.*, GROUP_CONCAT(m.name) as participants
         FROM events e 
         LEFT JOIN event_members em ON e.id = em.event_id
         LEFT JOIN members m ON em.member_id = m.id
         WHERE e.event_date >= CURDATE()
         GROUP BY e.id
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
    const [members] = await pool.execute(
        `SELECT m.*, 
         (SELECT COUNT(*) FROM event_members em 
          JOIN events e ON em.event_id = e.id 
          WHERE em.member_id = m.id AND e.event_date >= CURDATE()) as upcoming_events,
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
    const [documents] = await pool.execute(
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
    const upcomingCount = events.length;
    const nearestEvent = events[0];
    
    if (upcomingCount === 0) {
        return "No hay eventos próximos programados.";
    }

    return `Tienes ${upcomingCount} eventos próximos. El más cercano es "${nearestEvent.name}" el ${new Date(nearestEvent.event_date).toLocaleDateString()}.`;
}

function formatMemberResponse(members, query) {
    return `Encontré ${members.length} miembros en tu familia. ` + 
           `En total tienen ${members.reduce((sum, m) => sum + m.upcoming_events, 0)} eventos próximos y ` +
           `${members.reduce((sum, m) => sum + m.document_count, 0)} documentos almacenados.`;
}

function formatDocumentResponse(documents, query) {
    const groupedDocs = documents.reduce((acc, doc) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
        return acc;
    }, {});

    return `Tienes ${documents.length} documentos almacenados. ` +
           `Tipos de documentos: ${Object.entries(groupedDocs)
               .map(([type, count]) => `${count} ${type}`)
               .join(', ')}.`;
}

module.exports = router;