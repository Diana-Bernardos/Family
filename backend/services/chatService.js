// backend/services/chatService.js
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

class ChatService {
    static async getFullContext(userId) {
        try {
            const [events, members, tasks, reminders] = await Promise.all([
                this.getEvents(userId),
                this.getMembers(),
                this.getTasks(userId),
                this.getReminders(userId)
            ]);

            return {
                events,
                members,
                tasks,
                reminders
            };
        } catch (error) {
            console.error('Error getting context:', error);
            throw error;
        }
    }

    static async getEvents(userId) {
        try {
            const [events] = await pool.query(`
                SELECT e.*, em.member_id,
                       COALESCE(m.name, 'Sin asignar') as member_name
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE e.event_date >= CURDATE()
                ORDER BY e.event_date ASC
            `);
            return events;
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    static async getMembers() {
        try {
            const [members] = await pool.query(`
                SELECT m.*, COUNT(e.id) as total_events
                FROM members m
                LEFT JOIN event_members em ON m.id = em.member_id
                LEFT JOIN events e ON em.event_id = e.id
                GROUP BY m.id
            `);
            return members;
        } catch (error) {
            console.error('Error getting members:', error);
            return [];
        }
    }

    static async getTasks(userId) {
        try {
            const [tasks] = await pool.query(`
                SELECT * FROM tasks 
                WHERE user_id = ? AND completed = FALSE
                ORDER BY due_date ASC
            `, [userId]);
            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    }

    static async getReminders(userId) {
        try {
            const [reminders] = await pool.query(`
                SELECT r.*, e.name as event_name
                FROM reminders r
                LEFT JOIN events e ON r.event_id = e.id
                WHERE r.user_id = ? AND r.status = 'active'
                ORDER BY reminder_date ASC
            `, [userId]);
            return reminders;
        } catch (error) {
            console.error('Error getting reminders:', error);
            return [];
        }
    }

    static createPrompt(message, context) {
        const { events, members, tasks, reminders } = context;

        return `Eres un asistente familiar especializado para nuestra aplicación. 
        Debes ayudar a gestionar la organización familiar respondiendo sobre:

        DATOS ACTUALES DE LA FAMILIA:

        EVENTOS PRÓXIMOS (${events.length}):
        ${events.map(e => 
            `- ${e.name} el ${new Date(e.event_date).toLocaleDateString('es-ES')} (Asignado a: ${e.member_name})`
        ).join('\n')}

        MIEMBROS DE LA FAMILIA (${members.length}):
        ${members.map(m => `- ${m.name}`).join('\n')}

        TAREAS PENDIENTES (${tasks.length}):
        ${tasks.map(t => 
            `- ${t.title} (Vence: ${new Date(t.due_date).toLocaleDateString('es-ES')})`
        ).join('\n')}

        RECORDATORIOS ACTIVOS (${reminders.length}):
        ${reminders.map(r => 
            `- ${r.title} ${r.event_name ? `para ${r.event_name}` : ''}`
        ).join('\n')}

        INSTRUCCIONES:
        1. Responde usando SOLO la información proporcionada arriba
        2. Si te preguntan por datos que no tienes, indícalo claramente
        3. Mantén un tono amigable y familiar
        4. Proporciona fechas en formato legible
        5. Sugiere acciones basadas en el contexto
        6. Si no entiendes algo, pide aclaración

        CONSULTA DEL USUARIO: ${message}`;
    }

    static async sendMessage(userId, message) {
        try {
            // Obtener contexto actualizado
            const context = await this.getFullContext(userId);
            
            // Crear prompt con contexto
            const prompt = this.createPrompt(message, context);

            // Llamar a Ollama
            const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
                model: config.MODEL_NAME,
                prompt: prompt,
                options: {
                    temperature: 0.7,
                    top_k: 40,
                    top_p: 0.9,
                    num_ctx: 2048,
                    repeat_penalty: 1.1
                }
            });

            // Guardar interacción
            await this.saveInteraction(userId, message, response.data.response, context);

            return {
                success: true,
                response: response.data.response,
                context: context
            };
        } catch (error) {
            console.error('Error in sendMessage:', error);
            throw error;
        }
    }

    static async saveInteraction(userId, message, response, context) {
        try {
            await pool.query(
                'INSERT INTO chat_interactions (user_id, message, response, context, created_at) VALUES (?, ?, ?, ?, NOW())',
                [userId, message, response, JSON.stringify(context)]
            );
        } catch (error) {
            console.error('Error saving interaction:', error);
        }
    }
}

module.exports = ChatService;