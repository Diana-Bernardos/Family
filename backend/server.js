// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const memberRoutes = require('./routes/memberRoutes');
const noteRoutes = require('./routes/noteRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/members', memberRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});