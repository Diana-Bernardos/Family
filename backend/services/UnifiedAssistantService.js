// backend/services/UnifiedAssistantService.js

const pool = require('../config/database');

class UnifiedAssistantService {
    async processQuery(query, type = 'general', memberId = null) {
        try {
            const context = memberId ? 
                await this.getMemberContext(memberId) : 
                await this.getContextData();

            return {
                success: true,
                data: {
                    query,
                    type,
                    context,
                    response: 'Procesado con éxito'
                }
            };
        } catch (error) {
            console.error('Error en processQuery:', error);
            throw error;
        }
    }

    async getContextData() {
        try {
            // Obtener eventos con sus participantes
            const [events] = await pool.query(`
                SELECT e.id, e.name, e.creation_date, e.event_date, 
                       e.event_type, e.icon, e.color, 
                       GROUP_CONCAT(m.name) as participants 
                FROM events e 
                LEFT JOIN event_members em ON e.id = em.event_id 
                LEFT JOIN members m ON em.member_id = m.id 
                WHERE e.event_date >= CURDATE() 
                GROUP BY e.id, e.name, e.creation_date, e.event_date, 
                         e.event_type, e.icon, e.color
                ORDER BY e.event_date
            `);

            // Obtener miembros
            const [members] = await pool.query(`
                SELECT id, name, email, phone, birth_date, created_at
                FROM members
            `);

            return {
                success: true,
                data: {
                    events: events || [],
                    members: members || []
                }
            };
        } catch (error) {
            console.error('Error en getContextData:', error);
            throw error;
        }
    }

    async getMemberContext(memberId) {
        try {
            // Obtener información del miembro
            const [member] = await pool.query(
                'SELECT id, name, email, phone, birth_date, created_at FROM members WHERE id = ?',
                [memberId]
            );

            if (!member[0]) {
                throw new Error('Miembro no encontrado');
            }

            // Obtener eventos del miembro
            const [events] = await pool.query(`
                SELECT e.id, e.name, e.event_date, e.event_type, e.icon, e.color
                FROM events e
                INNER JOIN event_members em ON e.id = em.event_id
                WHERE em.member_id = ?
                ORDER BY e.event_date DESC
            `, [memberId]);

            // Obtener documentos del miembro
            const [documents] = await pool.query(`
                SELECT id, document_name, document_type, file_size, upload_date 
                FROM member_documents 
                WHERE member_id = ?
                ORDER BY upload_date DESC
            `, [memberId]);

            return {
                success: true,
                data: {
                    member: member[0],
                    events: events || [],
                    documents: documents || []
                }
            };
        } catch (error) {
            console.error('Error en getMemberContext:', error);
            throw error;
        }
    }

    async getEventHistory() {
        try {
            const [events] = await pool.query(`
                SELECT e.*, GROUP_CONCAT(m.name) as participants
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE e.event_date < CURDATE()
                GROUP BY e.id, e.name, e.creation_date, e.event_date, 
                         e.event_type, e.icon, e.color
                ORDER BY e.event_date DESC
                LIMIT 10
            `);
            
            return {
                success: true,
                data: events || []
            };
        } catch (error) {
            console.error('Error en getEventHistory:', error);
            throw error;
        }
    }

    async getUpcomingEvents() {
        try {
            const [events] = await pool.query(`
                SELECT e.*, GROUP_CONCAT(m.name) as participants
                FROM events e
                LEFT JOIN event_members em ON e.id = em.event_id
                LEFT JOIN members m ON em.member_id = m.id
                WHERE e.event_date >= CURDATE()
                GROUP BY e.id, e.name, e.creation_date, e.event_date, 
                         e.event_type, e.icon, e.color
                ORDER BY e.event_date
                LIMIT 10
            `);
            
            return {
                success: true,
                data: events || []
            };
        } catch (error) {
            console.error('Error en getUpcomingEvents:', error);
            throw error;
        }
    }

    async getMemberDocuments(memberId) {
        try {
            const [documents] = await pool.query(
                `SELECT id, document_name, document_type, file_size, upload_date
                 FROM member_documents 
                 WHERE member_id = ?
                 ORDER BY upload_date DESC`,
                [memberId]
            );
            
            return {
                success: true,
                data: documents || []
            };
        } catch (error) {
            console.error('Error en getMemberDocuments:', error);
            throw error;
        }
    }

    async getEventSuggestions() {
        try {
            const [events] = await pool.query(`
                SELECT e.event_type, COUNT(*) as count
                FROM events e
                GROUP BY e.event_type
                ORDER BY count DESC
                LIMIT 5
            `);
            
            return {
                success: true,
                data: events || []
            };
        } catch (error) {
            console.error('Error en getEventSuggestions:', error);
            throw error;
        }
    }
}

module.exports = new UnifiedAssistantService();