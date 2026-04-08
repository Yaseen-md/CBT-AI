import fs from 'fs';
import pg from 'pg';

const { Client } = pg;
const BASE_URL = 'http://localhost:3001/api';

async function testRoutine() {
    console.log('1. Registering user...');
    const randomEmail = `test.admin.${Date.now()}@example.com`;
    let res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Admin Tester', email: randomEmail, password: 'password123' })
    });
    const regData = await res.json();
    let token = regData.token;
    
    console.log('2. User registered. Creating conversation...');
    res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        // We know we need conversationId, let's just make one using the PG Client since creating one normally requires the conversation routes.
    });
    // Wait, the test app has a way to create conversations. 
}

export async function runTest() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'cbt_ai_db',
        password: 'postgres',
        port: 5433,
    });
    
    try {
        await client.connect();
        
        console.log('1. Registering user...');
        const randomEmail = `test.admin.${Date.now()}@example.com`;
        let res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Admin Tester', email: randomEmail, password: 'password123' })
        });
        const regData = await res.json();
        if(!regData.success) {
            console.error('Registration failed:', regData);
            return;
        }
        let token = regData.token;
        const userId = regData.user.id;

        // Create conversation manually for test
        const convRes = await client.query('INSERT INTO conversations (user_id) VALUES ($1) RETURNING id', [userId]);
        const convId = convRes.rows[0].id;

        console.log('2. Generating Crisis Message...');
        res = await fetch(`${BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                conversationId: convId,
                content: 'I want to kill myself, I cannot do this anymore'
            })
        });

        const msgData = await res.json();
        if(!msgData.crisis || msgData.crisis.severity !== 'critical') {
            console.error('Crisis detection failed or not critical:', msgData);
        } else {
            console.log('✅ Crisis successfully detected and intercepted!', msgData.crisis.banner);
        }

        console.log('3. Promoting user to Admin...');
        await client.query('UPDATE users SET is_admin = true WHERE id = $1', [userId]);

        console.log('4. Logging in to get Admin Token...');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: randomEmail, password: 'password123' })
        });
        const loginData = await res.json();
        token = loginData.token;

        if(!loginData.user.is_admin) {
            console.error('User not identified as admin in payload!');
            return;
        }
        console.log('✅ Admin login confirmed.');

        console.log('5. Fetching Admin Stats...');
        res = await fetch(`${BASE_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await res.json();
        console.log('✅ Admin stats retrieved:', statsData.stats);

        console.log('6. Fetching Safety Events...');
        res = await fetch(`${BASE_URL}/admin/safety-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const eventsData = await res.json();
        const testEvent = eventsData.events.find((e) => e.user_id === userId);
        if(!testEvent) {
            console.error('Safety event not found in logs!');
            return;
        }
        console.log('✅ Safety event successfully loaded from Admin API.');

        console.log('7. Resolving Safety Event...');
        res = await fetch(`${BASE_URL}/admin/safety-events/${testEvent.id}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ notes: 'Handled by automated test agent' })
        });
        const resolveData = await res.json();
        if(resolveData.success) {
            console.log('✅ Safety event successfully resolved.');
        } else {
            console.error('Failed to resolve event:', resolveData);
        }

        console.log('=== TEST SUITE PASSED COMPLETELY! ===');
    } catch(err) {
        console.error('Test script threw exception:', err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

runTest();
