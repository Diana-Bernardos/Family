// backend/services/chatService.js
const pool = require('../config/database');
const { analyzeIntent } = require('./intentService');
const { handleAction } = require('./actionService');
const { updateContext, getRecentContext } = require('./contextService');
const { formatDate } = require('../utils/formatters');

class ChatService {
   static recentContexts = new Map();

   static async getFullContext(userId) {
       try {
           // Verificar si existe contexto reciente
           const recentContext = getRecentContext(userId);
           if (recentContext) {
               return recentContext;
           }

           // Obtener nuevo contexto
           const [
               events,
               members, 
               tasks,
               reminders,
               calendarEvents
           ] = await Promise.all([
               this.getEvents(),
               this.getMembers(),
               this.getTasks(userId),
               this.getReminders(userId),
               this.getCalendarEvents()
           ]);

           const context = {
               events,
               members,
               tasks,
               reminders,
               calendarEvents,
               lastUpdate: Date.now()
           };

           // Actualizar cache de contexto
           updateContext(userId, context);

           return context;

       } catch (error) {
           console.error('Error getting context:', error);
           throw error;
       }
   }

   static async getEvents() {
       try {
           const [events] = await pool.query(`
               SELECT 
                   e.*,
                   em.member_id,
                   COALESCE(m.name, 'Sin asignar') as member_name,
                   e.event_type,
                   e.color,
                   e.icon,
                   COUNT(r.id) as reminder_count
               FROM events e
               LEFT JOIN event_members em ON e.id = em.event_id
               LEFT JOIN members m ON em.member_id = m.id
               LEFT JOIN reminders r ON e.id = r.event_id
               WHERE e.event_date >= CURDATE()
               GROUP BY e.id
               ORDER BY e.event_date ASC
           `);
           return events;
       } catch (error) {
           console.error('Error getting events:', error);
           throw error;
       }
   }

   static async getMembers() {
       try {
           const [members] = await pool.query(`
               SELECT m.*,
                      COUNT(DISTINCT e.id) as total_events,
                      COUNT(DISTINCT t.id) as total_tasks
               FROM members m
               LEFT JOIN event_members em ON m.id = em.member_id
               LEFT JOIN events e ON em.event_id = e.id AND e.event_date >= CURDATE()
               LEFT JOIN tasks t ON m.id = t.member_id AND t.completed = FALSE
               GROUP BY m.id
           `);
           return members;
       } catch (error) {
           console.error('Error getting members:', error);
           throw error;
       }
   }

   static async getTasks(userId) {
       try {
           const [tasks] = await pool.query(`
               SELECT t.*,
                      DATEDIFF(t.due_date, CURDATE()) as days_remaining,
                      m.name as assigned_to
               FROM tasks t
               LEFT JOIN members m ON t.member_id = m.id
               WHERE t.user_id = ? AND t.completed = FALSE
               ORDER BY t.due_date ASC, t.priority DESC
           `, [userId]);
           return tasks;
       } catch (error) {
           console.error('Error getting tasks:', error);
           throw error;
       }
   }

   static async getReminders(userId) {
       try {
           const [reminders] = await pool.query(`
               SELECT r.*,
                      e.name as event_name,
                      e.event_date as event_date,
                      e.event_type
               FROM reminders r
               LEFT JOIN events e ON r.event_id = e.id
               WHERE r.user_id = ? AND r.status = 'active'
               ORDER BY r.reminder_date ASC
           `, [userId]);
           return reminders;
       } catch (error) {
           console.error('Error getting reminders:', error);
           throw error;
       }
   }

   static async getCalendarEvents() {
       try {
           const [events] = await pool.query(`
               SELECT ce.*,
                      COUNT(r.id) as reminder_count,
                      GROUP_CONCAT(DISTINCT m.name) as participants
               FROM calendar_events ce
               LEFT JOIN reminders r ON ce.id = r.event_id
               LEFT JOIN event_members em ON ce.id = em.event_id
               LEFT JOIN members m ON em.member_id = m.id
               WHERE ce.event_date >= CURDATE()
               GROUP BY ce.id
               ORDER BY ce.event_date ASC
           `);
           return events;
       } catch (error) {
           console.error('Error getting calendar events:', error);
           throw error;
       }
   }

   static async generateSuggestions(context) {
       try {
           const { events, tasks, reminders } = context;
           const suggestions = [];

           // Eventos próximos 24h
           const upcomingEvents = events.filter(e => 
               new Date(e.event_date) <= new Date(Date.now() + 24*60*60*1000)
           );
           if (upcomingEvents.length > 0) {
               suggestions.push({
                   type: 'events',
                   message: `Tienes ${upcomingEvents.length} eventos en las próximas 24 horas`,
                   data: upcomingEvents.map(e => ({
                       name: e.name,
                       date: formatDate(e.event_date),
                       assignedTo: e.member_name
                   }))
               });
           }

           // Tareas urgentes
           const urgentTasks = tasks.filter(t => 
               !t.completed && new Date(t.due_date) <= new Date()
           );
           if (urgentTasks.length > 0) {
               suggestions.push({
                   type: 'tasks',
                   message: `Tienes ${urgentTasks.length} tareas pendientes urgentes`,
                   data: urgentTasks.map(t => ({
                       title: t.title,
                       dueDate: formatDate(t.due_date),
                       assignedTo: t.assigned_to
                   }))
               });
           }

           // Recordatorios próximos
           const upcomingReminders = reminders.filter(r => 
               new Date(r.reminder_date) <= new Date(Date.now() + 24*60*60*1000)
           );
           if (upcomingReminders.length > 0) {
               suggestions.push({
                   type: 'reminders',
                   message: `Tienes ${upcomingReminders.length} recordatorios para las próximas 24 horas`,
                   data: upcomingReminders.map(r => ({
                       title: r.title,
                       date: formatDate(r.reminder_date),
                       eventName: r.event_name
                   }))
               });
           }

           return suggestions;
       } catch (error) {
           console.error('Error generating suggestions:', error);
           return [];
       }
   }

   static async saveInteraction(userId, message, response, context, intent) {
       try {
           await pool.query(`
               INSERT INTO chat_interactions 
               (user_id, message, response, context, intent, created_at) 
               VALUES (?, ?, ?, ?, ?, NOW())
           `, [userId, message, response, JSON.stringify(context), intent]);
       } catch (error) {
           console.error('Error saving interaction:', error);
           throw error;
       }
   }

   static validateInput(message) {
       if (!message || typeof message !== 'string') {
           throw new Error('Mensaje inválido');
       }
       if (message.length > 500) {
           throw new Error('Mensaje demasiado largo');
       }
       return message.trim();
   }
}

module.exports = ChatService;