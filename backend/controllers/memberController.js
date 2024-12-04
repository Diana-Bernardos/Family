const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configuración de multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/')  // Asegúrate de que esta carpeta existe
  },
  filename: function(req, file, cb) {
    cb(null, `member-${Date.now()}${path.extname(file.originalname)}`)
  }
});

// Configurar multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB límite
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Solo imágenes!');
    }
  }
}).single('photo');

// Obtener todos los miembros
exports.getAllMembers = (req, res) => {
  db.query('SELECT * FROM members ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Obtener un miembro por ID
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

// Crear un nuevo miembro
exports.createMember = (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    db.query(
      'INSERT INTO members (name, photo_url) VALUES (?, ?)',
      [name, photoUrl],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          id: results.insertId,
          name,
          photo_url: photoUrl,
          created_at: new Date()
        });
      }
    );
  });
};

// Actualizar un miembro
exports.updateMember = (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { id } = req.params;
    const { name } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Si hay una nueva foto, actualizar todo
    if (photoUrl) {
      db.query(
        'UPDATE members SET name = ?, photo_url = ? WHERE id = ?',
        [name, photoUrl, id],
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
    } else {
      // Si no hay nueva foto, solo actualizar el nombre
      db.query(
        'UPDATE members SET name = ? WHERE id = ?',
        [name, id],
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
    }
  });
};

// Eliminar un miembro
exports.deleteMember = (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM members WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  });
};