// backend/utils/dbInit.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    let connection;
    try {
        // Crear conexión inicial sin especificar base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Dianaleire',
            multipleStatements: true
        });

        console.log('✓ Conectado a MySQL');

        // Leer el archivo SQL
        const sqlFile = path.join(__dirname, '../family.sql');
        let sqlContent;
        
        try {
            sqlContent = fs.readFileSync(sqlFile, 'utf-8');
        } catch (err) {
            // Si no está en el backend, buscar en la raíz
            const rootSqlFile = path.join(__dirname, '../../family.sql');
            sqlContent = fs.readFileSync(rootSqlFile, 'utf-8');
        }

        // Ejecutar el archivo SQL
        await connection.query(sqlContent);
        console.log('✓ Base de datos inicializada correctamente');

        // Verificar que las tablas fueron creadas
        const [tables] = await connection.query(`
            SELECT TABLE_NAME FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME || 'calendar_app']);

        console.log(`✓ Tablas creadas: ${tables.map(t => t.TABLE_NAME).join(', ')}`);

        await connection.end();
        return true;
    } catch (error) {
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('✗ Error: Credenciales de la base de datos incorrectas');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('✗ Error: No se pudo conectar al servidor MySQL');
        } else {
            console.error('✗ Error al inicializar la BD:', error.message);
        }
        throw error;
    }
}

module.exports = { initializeDatabase };
