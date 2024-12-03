
const db = require('../config/database');

exports.getAllMembers = (req, res) => {
  db.query('SELECT * FROM members ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getMemberById = (req, res) => {
  const { id } = req.params;
  
  db.query(
    'SELECT * FROM members WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json(results[0]);
    }
  );
};

exports.createMember = (req, res) => {
  const { name, photo_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query(
    'INSERT INTO members (name, photo_url) VALUES (?, ?)',
    [name, photo_url],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        id: results.insertId,
        name,
        photo_url,
        created_at: new Date()
      });
    }
  );
};

exports.updateMember = (req, res) => {
  const { id } = req.params;
  const { name, photo_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query(
    'UPDATE members SET name = ?, photo_url = ? WHERE id = ?',
    [name, photo_url, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json({ message: 'Member updated successfully' });
    }
  );
};

exports.deleteMember = (req, res) => {
  const { id } = req.params;
  
  // Las notas y eventos se eliminarán automáticamente por la restricción ON DELETE CASCADE
  db.query(
    'DELETE FROM members WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }
      res.json({ message: 'Member deleted successfully' });
    }
  );
};
