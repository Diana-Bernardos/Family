const db = require('../config/database');

exports.getFamilyEvents = (req, res) => {
  const query = `
    SELECT events.*, members.name as member_name 
    FROM events 
    LEFT JOIN members ON events.member_id = members.id 
    ORDER BY date ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getMemberEvents = (req, res) => {
  const { memberId } = req.params;
  
  db.query(
    'SELECT * FROM events WHERE member_id = ? ORDER BY date ASC',
    [memberId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

exports.createEvent = (req, res) => {
  const { title, description, date, time, activity_type, location, color, member_id } = req.body;
  
  db.query(
    'INSERT INTO events (title, description, date, time, activity_type, location, color, member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [title, description, date, time, activity_type, location, color, member_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
};

exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, activity_type, location, color } = req.body;
  
  db.query(
    'UPDATE events SET title = ?, description = ?, date = ?, time = ?, activity_type = ?, location = ?, color = ? WHERE id = ?',
    [title, description, date, time, activity_type, location, color, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Event updated successfully' });
    }
  );
};

exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM events WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Event deleted successfully' });
  });
};