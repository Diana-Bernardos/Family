const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const axios = require('axios');
const config = require('../config/config');

// Análisis de intenciones
const intents = {
    calendar: ['evento', 'calendario', 'fecha', 'cuando', 'programado'],
    members: ['miembro', 'familia', 'quien', 'contacto'],
    tasks: ['tarea', 'pendiente', 'hacer', 'completar'],
    reminders: ['recordatorio', 'recordar', 'avisar']
};

function analyzeIntent(query) {
    query = query.toLowerCase();
    for (const [intent, keywords] of Object.entries(intents)) {
        if (keywords.some(keyword => query.includes(keyword))) {
            return intent;
        }
    }
    return 'general';
}

// Funciones de obtención de datos
async function getRelevantEvents(userId) {
    try {
        const [events] = await pool.query(`
            SELECT e.*, em.member_id,
                   COALESCE(m.name, 'Sin asignar') as member_name,
                   e.event_type,
                   e.color,
                   e.icon
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

async function getRelevantMembers() {
    try {
        const [members] = await pool.query(`
            SELECT m.*, 
                   COUNT(e.id) as total_events
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

async function getTasks(userId) {
    try {
        const [tasks] = await pool.query(`
            SELECT t.*, 
                   DATEDIFF(t.due_date, CURDATE()) as days_remaining
            FROM tasks t
            WHERE user_id = ? 
            AND completed = FALSE
            ORDER BY due_date ASC
        `, [userId]);
        return tasks;
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
}

async function getReminders(userId) {
    try {
        const [reminders] = await pool.query(`
            SELECT r.*,
                   e.name as event_name
            FROM reminders r
            LEFT JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ? 
            AND r.status = 'active'
            ORDER BY reminder_date ASC
        `, [userId]);
        return reminders;
    } catch (error) {
        console.error('Error getting reminders:', error);
        return [];
    }
}

async function getCalendarEvents() {
    try {
        const [calendarEvents] = await pool.query(`
            SELECT ce.*,
                   COUNT(r.id) as reminder_count
            FROM calendar_events ce
            LEFT JOIN reminders r ON ce.id = r.event_id
            WHERE ce.event_date >= CURDATE()
            GROUP BY ce.id
            ORDER BY ce.event_date ASC
        `);
        return calendarEvents;
    } catch (error) {
        console.error('Error getting calendar events:', error);
        return [];
    }
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function createPrompt(query, context, intent) {
    const { events, members, tasks, reminders } = context;
    
    // Formatear datos según la intención
    let relevantData = '';
    switch (intent) {
        case 'calendar':
            relevantData = formatCalendarData(events, reminders);
            break;
        case 'members':
            relevantData = formatMembersData(members, events);
            break;
        case 'tasks':
            relevantData = formatTasksData(tasks);
            break;
        case 'reminders':
            relevantData = formatRemindersData(reminders);
            break;
        default:
            relevantData = formatAllData(context);
    }

    return `Eres un asistente especializado para nuestra aplicación de organización familiar.

${relevantData}

CAPACIDADES:
1. Gestionar el calendario familiar y eventos
2. Administrar información de miembros de la familia
3. Manejar tareas y recordatorios
4. Ayudar con la organización familiar
5. Proporcionar información sobre eventos próximos
6. Mostrar detalles de los miembros

INSTRUCCIONES:
- Usa solo la información proporcionada arriba
- Da respuestas específicas sobre esta familia
- Mantén un tono amigable y personal
- Proporciona fechas en formato legible
- Sugiere acciones relevantes basadas en el contexto
- Si no tienes cierta información, indícalo claramente

CONSULTA DEL USUARIO: ${query}`;
}

function formatAllData(context) {
    const { events, members, tasks, reminders } = context;
    
    return `
DATOS ACTUALES DE LA FAMILIA:

EVENTOS PRÓXIMOS:
${events.map(event => `- ${event.name} (${formatDate(event.event_date)})
  Asignado a: ${event.member_name}
  Tipo: ${event.event_type || 'No especificado'}
  ${event.icon ? `Icono: ${event.icon}` : ''}`).join('\n')}

MIEMBROS DE LA FAMILIA:
${members.map(member => `- ${member.name}
  Email: ${member.email || 'No especificado'}
  Teléfono: ${member.phone || 'No especificado'}
  Eventos asociados: ${member.total_events || 0}`).join('\n')}

TAREAS PENDIENTES:
${tasks.map(task => `- ${task.title}
  Vence en: ${task.days_remaining} días
  Prioridad: ${task.priority || 'Normal'}`).join('\n')}

RECORDATORIOS ACTIVOS:
${reminders.map(reminder => `- ${reminder.title}
  Fecha: ${formatDate(reminder.reminder_date)}
  ${reminder.event_name ? `Para evento: ${reminder.event_name}` : ''}`).join('\n')}`;
}

async function getAIResponse(query, context) {
    try {
        const intent = analyzeIntent(query);
        const prompt = createPrompt(query, context, intent);
        
        const response = await axios.post(`${config.OLLAMA_API_URL}/generate`, {
            model: config.MODEL_NAME,
            prompt: prompt,
            options: {
                temperature: 0.3,
                top_k: 10,
                top_p: 0.9,
                num_ctx: 2048,
                repeat_penalty: 1.2
            }
        });

        return {
            response: response.data.response,
            context: context,
            intent: intent
        };
    } catch (error) {
        console.error('Error AI response:', error);
        throw error;
    }
}

router.post('/process', async (req, res) => {
    const { message, userId } = req.body;

    try {
        // Validar entrada
        if (!message || typeof message !== 'string' || message.length > 500) {
            throw new Error('Mensaje inválido');
        }

        // Obtener todos los datos relevantes
        const [events, members, tasks, reminders, calendarEvents] = 
            await Promise.all([
                getRelevantEvents(),
                getRelevantMembers(),
                getTasks(userId),
                getReminders(userId),
                getCalendarEvents()
            ]);

        const context = {
            events,
            members,
            tasks,
            reminders,
            calendarEvents
        };

        const aiResponse = await getAIResponse(message.trim(), context);

        // Guardar la interacción
        await pool.query(
            'INSERT INTO chat_interactions (user_id, message, response, context, intent, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [userId, message, aiResponse.response, JSON.stringify(context), aiResponse.intent]
        );

        res.json({
            success: true,
            response: aiResponse.response,
            context: context,
            intent: aiResponse.intent
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            error: 'Error al procesar el mensaje',
            details: error.message 
        });
    }
});

module.exports = router;