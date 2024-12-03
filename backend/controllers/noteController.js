// controllers/noteController.js
const db = require('../config/database');

exports.getNotesByMember = (req, res) => {
  const { memberId } = req.params;
  
  db.query(
    'SELECT * FROM notes WHERE member_id = ? ORDER BY created_at DESC',
    [memberId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

exports.createNote = (req, res) => {
  const { member_id, content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  if (!member_id) {
    return res.status(400).json({ error: 'Member ID is required' });
  }

  // Verificar que el miembro existe
  db.query(
    'SELECT id FROM members WHERE id = ?',
    [member_id],
    (err, memberResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (memberResults.length === 0) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Crear la nota
      db.query(
        'INSERT INTO notes (member_id, content) VALUES (?, ?)',
        [member_id, content],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            id: results.insertId,
            member_id,
            content,
            created_at: new Date()
          });
        }
      );
    }
  );
};

exports.updateNote = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  db.query(
    'UPDATE notes SET content = ? WHERE id = ?',
    [content, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note updated successfully' });
    }
  );
};

exports.deleteNote = (req, res) => {
  const { id } = req.params;
  
  db.query(
    'DELETE FROM notes WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json({ message: 'Note deleted successfully' });
    }
  );
};