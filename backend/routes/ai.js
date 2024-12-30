const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

async function getRelevantEvents(userId) {
    try {
        const [events] = await pool.query(`
            SELECT e.* 
            FROM events e
            LEFT JOIN event_members em ON e.id = em.event_id
            WHERE em.member_id = ? AND e.event_date >= CURDATE()
            ORDER BY e.event_date ASC
        `, [userId]);
        return events;
    } catch (error) {
        console.error('Error getting events:', error);
        return [];
    }
}

async function getRelevantMembers(userId) {
    try {
        const [members] = await pool.query('SELECT * FROM members WHERE id != ?', [userId]);
        return members;
    } catch (error) {
        console.error('Error getting members:', error);
        return [];
    }
}

async function getUserPreferences(userId) {
    try {
        const [preferences] = await pool.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
        return preferences[0] || {};
    } catch (error) {
        console.error('Error getting preferences:', error);
        return {};
    }
}

async function getSearchHistory(userId) {
    try {
        const [history] = await pool.query(`
            SELECT * FROM chat_interactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 10
        `, [userId]);
        return history;
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
}

async function getAIResponse(query, context) {
    try {
        const prompt = createPrompt(query, context);
        
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: prompt,
            options: {
                temperature: 0.7,
                top_k: 50,
                top_p: 0.95,
                num_ctx: 2048,
                repeat_penalty: 1.1
            }
        });

        return {
            response: response.data.response,
            context: context
        };
    } catch (error) {
        console.error('Error AI response:', error);
        throw error;
    }
}

function createPrompt(query, context) {
    const { events, members, tasks } = context;
    
    return `Eres un asistente específico para la aplicación de organización familiar.
    
    DATOS DISPONIBLES:
    ${events ? `Eventos: ${JSON.stringify(events)}` : 'No hay eventos'}
    ${members ? `Miembros: ${JSON.stringify(members)}` : 'No hay miembros'}
    ${tasks ? `Tareas: ${JSON.stringify(tasks)}` : 'No hay tareas'}

    FUNCIONES PERMITIDAS:
    - Gestionar eventos del calendario familiar
    - Mostrar información de miembros
    - Administrar tareas familiares
    - Consultar recordatorios
    
    RESTRICCIONES:
    - Solo responde sobre la aplicación familiar
    - No des información general
    - No contestes preguntas no relacionadas
    - Usa solo los datos proporcionados
    
    Consulta: ${query}`;
}

async function saveToHistory(userId, query, aiResponse) {
    try {
        await pool.query(
            'INSERT INTO chat_interactions (user_id, message, response, created_at) VALUES (?, ?, ?, NOW())',
            [userId, query, aiResponse.response]
        );
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

router.post('/analyze', async (req, res) => {
    const { userId, query } = req.body;
    
    try {
        const [events, members, history, userPreferences] = await Promise.all([
            getRelevantEvents(userId),
            getRelevantMembers(userId),
            getSearchHistory(userId),
            getUserPreferences(userId)
        ]);

        const aiContext = {
            events,
            members,
            history,
            userPreferences
        };

        const aiResponse = await getAIResponse(query, aiContext);
        await saveToHistory(userId, query, aiResponse);

        res.json(aiResponse);
    } catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({ 
            error: 'Analysis error',
            details: error.message 
        });
    }
});

router.post('/process', async (req, res) => {
    const { message, userId } = req.body;

    try {
        const [events] = await pool.query(
            'SELECT * FROM events WHERE event_date >= CURDATE() ORDER BY event_date ASC'
        );

        const [members] = await pool.query('SELECT * FROM members');

        const ollamaResponse = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: createPrompt(message, { events, members, history: [], userPreferences: {} }),
            options: {
                temperature: 0.3, // Más bajo para respuestas más precisas
                top_p: 0.1,      // Más restrictivo
                num_ctx: 2048
            }
        });

        await pool.query(
            'INSERT INTO chat_interactions (user_id, message, response, context, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, message, ollamaResponse.data.response, JSON.stringify({ events, members })]
        );

        res.json({
            success: true,
            response: ollamaResponse.data.response,
            context: { events, members }
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            error: 'Processing error',
            details: error.message 
        });
    }
});

module.exports = router;