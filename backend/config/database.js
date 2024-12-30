// config/database.js
const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
    host: process.env.DB_HOST || config.DB.host,
    user: process.env.DB_USER || config.DB.user,
    password: process.env.DB_PASSWORD || config.DB.password,
    database: process.env.DB_NAME || config.DB.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;