const request = require('supertest');
const server = require('../server');
const pool = require('../config/database');

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        try {
            await pool.query('DELETE FROM users WHERE email = ?', ['test@test.com']);
        } catch (error) {
            console.error('Error en setup:', error);
        }
    });

    afterAll(async () => {
        try {
            await pool.end();
            await server.close();
        } catch (error) {
            console.error('Error en cleanup:', error);
        }
    });

    test('should register a new user', async () => {
        const res = await request(server)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    test('should login existing user', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('should not login with wrong password', async () => {
        const res = await request(server)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toBe(401);
    });
});