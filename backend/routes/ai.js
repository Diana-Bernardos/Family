// routes/ai.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');
const pool = require ('../config/database');

// Funciones auxiliares para obtener datos
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
        console.error('Error obteniendo eventos:', error);
        return [];
    }
}

async function getRelevantMembers(userId) {
    try {
        const [members] = await pool.query(`
            SELECT * FROM members 
            WHERE id != ?
        `, [userId]);
        return members;
    } catch (error) {
        console.error('Error obteniendo miembros:', error);
        return [];
    }
}

async function getUserPreferences(userId) {
    try {
        const [preferences] = await pool.query(`
            SELECT * FROM user_preferences 
            WHERE user_id = ?
        `, [userId]);
        return preferences[0] || {};
    } catch (error) {
        console.error('Error obteniendo preferencias:', error);
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
        console.error('Error obteniendo historial:', error);
        return [];
    }
}

async function getAIResponse(query, context) {
    try {
        // Preparar prompt para el modelo de IA
        const prompt = createPrompt(query, context);

        // Llamada a Ollama 
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: message,
            stream: false,
            options: {
                temperature: 0.7,
                top_k: 50,
                top_p: 0.95,
                num_ctx: 2048
            }
        });

        return {
            response: response.data.response,
            context: context
        };
    } catch (error) {
        console.error('Error obteniendo respuesta de IA:', error);
        throw new Error('No se pudo procesar la consulta de IA');
    }
}

function createPrompt(query, context) {
    const { events, members, history, userPreferences } = context;

    // Formatear eventos
    const eventsText = events.map(event => 
        `- ${event.name} el ${new Date(event.event_date).toLocaleDateString()}`
    ).join('\n');

    // Formatear miembros
    const membersText = members.map(member => 
        `- ${member.name}`
    ).join('\n');

    // Crear prompt contextualizado
    return `Eres un asistente familiar inteligente. Tienes el siguiente contexto:

EVENTOS PRÓXIMOS:
${eventsText || 'No hay eventos próximos'}

MIEMBROS DE LA FAMILIA:
${membersText || 'No hay miembros registrados'}

HISTORIAL RECIENTE:
${history.map(h => h.message).join('\n') || 'Sin historial reciente'}

PREFERENCIAS DEL USUARIO:
${JSON.stringify(userPreferences) || 'Sin preferencias específicas'}

Basado en este contexto, responde a la siguiente consulta:
${query}

Instrucciones:
1. Sé conciso y preciso
2. Utiliza la información contextual
3. Ofrece sugerencias prácticas
4. Muestra los eventos de cualquier mes del calendario
5. Muestra los eventos de los miembros de la familia
6. Crea eventos o tareas en el calendario cuando se te pidan
7. Muestra detalles de los miembros de la familia
8. Mantén un tono amigable y familiar`;
}

async function saveToHistory(userId, query, aiResponse) {
    try {
        await pool.query(`
            INSERT INTO chat_interactions 
            (user_id, message, response, created_at) 
            VALUES (?, ?, ?, NOW())
        `, [userId, query, aiResponse.response]);
    } catch (error) {
        console.error('Error guardando historial:', error);
    }
}

// Rutas
router.post('/analyze', async (req, res) => {
    const { userId, query } = req.body;
    
    try {
        // Obtener datos relevantes
        const [events, members, history, userPreferences] = await Promise.all([
            getRelevantEvents(userId),
            getRelevantMembers(userId),
            getSearchHistory(userId),
            getUserPreferences(userId)
        ]);

        // Preparar contexto para la IA
        const aiContext = {
            events,
            members,
            history,
            userPreferences
        };

        // Obtener respuesta de la IA
        const aiResponse = await getAIResponse(query, aiContext);

        // Guardar en historial
        await saveToHistory(userId, query, aiResponse);

        res.json(aiResponse);
    } catch (error) {
        console.error('Error en análisis IA:', error);
        res.status(500).json({ 
            error: 'Error en análisis',
            details: error.message 
        });
    }
});

// Procesar mensaje con contexto
router.post('/process', async (req, res) => {
    const { message, userId } = req.body;

    try {
        // Obtener contexto
        const [events] = await pool.query(
            `SELECT * FROM events 
             WHERE event_date >= CURDATE()
             ORDER BY event_date ASC`
        );

        const [members] = await pool.query(
            'SELECT * FROM members'
        );

        // Llamada a Ollama para generar respuesta
        const ollamaResponse = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: `Contexto de eventos: ${JSON.stringify(events)}
Miembros de la familia: ${JSON.stringify(members)}
Consulta: ${message}
Responde de manera amigable y contextualizada.`,
            stream: false
        });

        // Guardar interacción
        await pool.query(
            `INSERT INTO chat_interactions 
             (user_id, message, response, context, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [
                userId, 
                message, 
                ollamaResponse.data.response, 
                JSON.stringify({ events, members })
            ]
        );

        res.json({
            success: true,
            response: ollamaResponse.data.response,
            context: { events, members }
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            error: 'Error processing message',
            details: error.message 
        });
    }
});

module.exports = router;