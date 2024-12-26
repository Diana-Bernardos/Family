// routes/ai.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

// Auxiliary functions to fetch data
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
        console.error('Error fetching events:', error);
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
        console.error('Error fetching members:', error);
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
        console.error('Error fetching preferences:', error);
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
        console.error('Error fetching search history:', error);
        return [];
    }
}

async function getAIResponse(query, context) {
    try {
        // Prepare the prompt for the AI model
        const prompt = createPrompt(query, context);

        // Call Ollama to generate the response
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: prompt,
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
        console.error('Error getting AI response:', error);
        throw new Error('Could not process the AI query');
    }
}

function createPrompt(query, context) {
    const { events, members, history, userPreferences } = context;

    // Format the events
    const eventsText = events.map(event => 
        `- ${event.name} on ${new Date(event.event_date).toLocaleDateString()}`
    ).join('\n');

    // Format the members
    const membersText = members.map(member => 
        `- ${member.name}`
    ).join('\n');

    // Create the contextualized prompt
    return `You are an intelligent family assistant. You have the following context:

UPCOMING EVENTS:
${eventsText || 'No upcoming events'}

FAMILY MEMBERS:
${membersText || 'No family members registered'}

RECENT HISTORY:
${history.map(h => h.message).join('\n') || 'No recent history'}

USER PREFERENCES:
${JSON.stringify(userPreferences) || 'No specific preferences'}

Based on this context, respond to the following query:
${query}

Instructions:
1. Be concise and precise
2. Utilize the contextual information
3. Offer practical suggestions
4. Maintain a friendly and familiar tone`;
}

async function saveToHistory(userId, query, aiResponse) {
    try {
        await pool.query(`
            INSERT INTO chat_interactions 
            (user_id, message, response, created_at) 
            VALUES (?, ?, ?, NOW())
        `, [userId, query, aiResponse.response]);
    } catch (error) {
        console.error('Error saving history:', error);
    }
}

// Routes
router.post('/analyze', async (req, res) => {
    const { userId, query } = req.body;
    
    try {
        // Fetch the relevant data
        const [events, members, history, userPreferences] = await Promise.all([
            getRelevantEvents(userId),
            getRelevantMembers(userId),
            getSearchHistory(userId),
            getUserPreferences(userId)
        ]);

        // Prepare the context for the AI
        const aiContext = {
            events,
            members,
            history,
            userPreferences
        };

        // Get the AI response
        const aiResponse = await getAIResponse(query, aiContext);

        // Save to history
        await saveToHistory(userId, query, aiResponse);

        res.json(aiResponse);
    } catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({ 
            error: 'Error in analysis',
            details: error.message 
        });
    }
});

// Process message with context
router.post('/process', async (req, res) => {
    const { message, userId } = req.body;

    try {
        // Fetch the context
        const [events] = await pool.query(
            `SELECT * FROM events 
             WHERE event_date >= CURDATE()
             ORDER BY event_date ASC`
        );

        const [members] = await pool.query(
            'SELECT * FROM members'
        );

        // Call Ollama to generate the response
        const ollamaResponse = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: `Event context: ${JSON.stringify(events)}
Family members: ${JSON.stringify(members)}
Query: ${message}
Respond in a friendly and contextualized manner.`,
            stream: false
        });

        // Save the interaction
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