// routes/ai.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');


router.post('/analyze', async (req, res) => {
    const { userId, query, context } = req.body;
    
    try {
        // Obtener datos relevantes
        const [events, members, history] = await Promise.all([
            getRelevantEvents(userId),
            getRelevantMembers(userId),
            getSearchHistory(userId)
        ]);

        // Preparar contexto para la IA
        const aiContext = {
            events,
            members,
            history,
            userPreferences: await getUserPreferences(userId)
        };

        // Obtener respuesta de la IA
        const aiResponse = await getAIResponse(query, aiContext);

        // Guardar en historial
        await saveToHistory(userId, query, aiResponse);

        res.json(aiResponse);
    } catch (error) {
        console.error('Error en análisis IA:', error);
        res.status(500).json({ error: 'Error en análisis' });
    }
});

// Procesar mensaje con IA
router.post('/process', async (req, res) => {
    const { message, userId } = req.body;

    try {
        // Obtener contexto
        const [events] = await pool.query(
            `SELECT * FROM events 
             WHERE member_id = ? 
             AND event_date >= CURDATE()
             ORDER BY event_date ASC`,
            [userId]
        );

        const [members] = await pool.query(
            'SELECT * FROM members'
        );

        // Guardar interacción
        await pool.query(
            `INSERT INTO chat_interactions 
             (user_id, message, context) 
             VALUES (?, ?, ?)`,
            [userId, message, JSON.stringify({ events, members })]
        );

        res.json({
            success: true,
            context: { events, members }
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Error processing message' });
    }
});

module.exports = router;