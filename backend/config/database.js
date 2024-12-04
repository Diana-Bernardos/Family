// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD

});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database successfully!');
  
  // Crear base de datos y tablas de manera secuencial
  connection.query('CREATE DATABASE IF NOT EXISTS family_calendar', (err) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }

    // Usar la base de datos
    connection.query('USE family_calendar', (err) => {
      if (err) {
        console.error('Error selecting database:', err);
        return;
      }

      // Crear tabla members
      const createMembersTable = `
        CREATE TABLE IF NOT EXISTS members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          photo_url VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

      connection.query(createMembersTable, (err) => {
        if (err) {
          console.error('Error creating members table:', err);
          return;
        }

        // Crear tabla notes
        const createNotesTable = `
          CREATE TABLE IF NOT EXISTS notes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            member_id INT,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
          )`;

        connection.query(createNotesTable, (err) => {
          if (err) {
            console.error('Error creating notes table:', err);
            return;
          }

          // Crear tabla events
          const createEventsTable = `
            CREATE TABLE IF NOT EXISTS events (
              id INT AUTO_INCREMENT PRIMARY KEY,
              title VARCHAR(100) NOT NULL,
              description TEXT,
              date DATE NOT NULL,
              color VARCHAR(7) DEFAULT '#007bff',
              member_id INT,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
            )`;

          connection.query(createEventsTable, (err) => {
            if (err) {
              console.error('Error creating events table:', err);
              return;
            }
            console.log('All tables created successfully!');
          });
        });
      });
    });
  });
});

// Exportar la conexión usando la base de datos correcta
const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'family_calendar'
});

module.exports = dbConnection;