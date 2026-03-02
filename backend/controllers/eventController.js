const pool = require('../config/database');

exports.getFamilyEvents = async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, 
             GROUP_CONCAT(m.name) as member_names,
             GROUP_CONCAT(m.id) as member_ids
      FROM events e
      LEFT JOIN event_members em ON e.id = em.event_id
      LEFT JOIN members m ON em.member_id = m.id
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);
    
    const formattedEvents = events.map(event => ({
      ...event,
      members: event.member_ids ? 
        event.member_ids.split(',').map((id, index) => ({
          id: parseInt(id),
          name: event.member_names.split(',')[index]
        })) : []
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error en getFamilyEvents:', error);
    res.status(500).json({ error: 'Error al obtener eventos familiares' });
  }
};

exports.getMemberEvents = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    const [events] = await pool.query(
      `SELECT e.* FROM events e
       INNER JOIN event_members em ON e.id = em.event_id
       WHERE em.member_id = ?
       ORDER BY e.event_date ASC`,
      [memberId]
    );
    
    res.json(events);
  } catch (error) {
    console.error('Error en getMemberEvents:', error);
    res.status(500).json({ error: 'Error al obtener eventos del miembro' });
  }
};

exports.createEvent = async (req, res) => {
  let connection;
  try {
    const { name, event_date, event_type, icon, color, members } = req.body;
    
    // Validación básica
    if (!name || !event_date) {
      return res.status(400).json({ error: 'El nombre y fecha del evento son requeridos' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let imageData = null;
    let imageType = null;

    if (req.file) {
      imageData = req.file.buffer;
      imageType = req.file.mimetype;
    }

    const [eventResult] = await connection.query(
      `INSERT INTO events (name, event_date, event_type, icon, color, image_data, image_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, event_date, event_type, icon, color, imageData, imageType]
    );

    const eventId = eventResult.insertId;

    // Agregar miembros si existen
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        await connection.query(
          'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
          [eventId, memberId]
        );
      }
    } else if (members && typeof members === 'string') {
      const memberIds = JSON.parse(members);
      for (const memberId of memberIds) {
        await connection.query(
          'INSERT INTO event_members (event_id, member_id) VALUES (?, ?)',
          [eventId, memberId]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      id: eventId,
      name,
      event_date,
      event_type,
      icon,
      color,
      members: members ? (Array.isArray(members) ? members : JSON.parse(members)) : []
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error al revertir transacción:', rollbackError);
      }
    }
    console.error('Error en createEvent:', error);
    res.status(500).json({ error: 'Error al crear evento: ' + error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, event_date, event_type, icon, color } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'ID del evento requerido' });
    }

    let imageData = undefined;
    let imageType = undefined;

    if (req.file) {
      imageData = req.file.buffer;
      imageType = req.file.mimetype;
    }

    let query = 'UPDATE events SET name = ?, event_date = ?, event_type = ?, icon = ?, color = ?';
    let params = [name, event_date, event_type, icon, color];

    if (imageData !== undefined) {
      query += ', image_data = ?, image_type = ?';
      params.push(imageData, imageType);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json({ message: 'Evento actualizado exitosamente', id });
  } catch (error) {
    console.error('Error en updateEvent:', error);
    res.status(500).json({ error: 'Error al actualizar evento: ' + error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'ID del evento requerido' });
    }

    const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteEvent:', error);
    res.status(500).json({ error: 'Error al eliminar evento: ' + error.message });
  }
};