// backend/utils/dbInit.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    // En producción (Netlify), si no hay DB_HOST o es localhost, no intentar inicializar
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
            console.warn('⚠️  DB_HOST no configurado o es localhost en producción. Saltando inicialización.');
            return false;
        }
    }

    let connection;
    try {
        // Crear conexión inicial con timeout corto para evitar 502
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Dianaleire',
            multipleStatements: true,
            connectTimeout: 5000 // 5 segundos max para conectar
        });

        console.log('✓ Conectado a MySQL para inicialización');

        // Intentar encontrar el archivo SQL en varias ubicaciones posibles en Netlify lambda
        const possiblePaths = [
            path.join(process.cwd(), 'family.sql'),
            path.join(__dirname, '../family.sql'),
            path.join(__dirname, '../../family.sql'),
            '/opt/build/repo/family.sql'
        ];

        let sqlContent;
        let foundPath = null;

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                sqlContent = fs.readFileSync(p, 'utf-8');
                foundPath = p;
                break;
            }
        }

        if (!sqlContent) {
            console.warn('⚠️  No se encontró family.sql en ninguna de las rutas probadas. Saltando inicialización.');
            await connection.end();
            return false;
        }

        console.log(`✓ Usando SQL desde: ${foundPath}`);

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
