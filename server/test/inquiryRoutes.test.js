const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret-for-inquiry-tests';

const { createApp } = require('../server');

function createToken(userId) {
    return jwt.sign(
        { id: userId, email: `staff${userId}@example.com` },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

function createTestApp(query) {
    return createApp({ query });
}

test('prevents staff from viewing another staff member inquiry', async () => {
    const database = async (sql, values) => {
        assert.match(sql, /id = \$1 AND created_by = \$2/);
        assert.deepEqual(values, [42, 7]);

        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .get('/api/inquiries/42')
        .set('Authorization', `Bearer ${createToken(7)}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Inquiry not found');
});

test('prevents staff from updating another staff member inquiry', async () => {
    const database = async (sql, values) => {
        assert.match(sql, /WHERE id = \$2 AND created_by = \$3/);
        assert.deepEqual(values, ['Resolved', 42, 7]);

        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .patch('/api/inquiries/42/status')
        .set('Authorization', `Bearer ${createToken(7)}`)
        .send({ status: 'Resolved' });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Inquiry not found');
});

test('retrieves inquiries using the logged-in staff member ID', async () => {
    const ownInquiry = {
        id: 10,
        customer_name: 'Test Customer',
        subject: 'Coffee order',
        status: 'New',
        created_by: 7
    };

    const database = async (sql, values) => {
        assert.match(sql, /created_by = \$1/);
        assert.deepEqual(values, [7]);

        return { rows: [ownInquiry] };
    };

    const response = await request(createTestApp(database))
        .get('/api/inquiries')
        .set('Authorization', `Bearer ${createToken(7)}`);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, [ownInquiry]);
});

test('rejects an empty customer name', async () => {
    let databaseCalled = false;

    const database = async () => {
        databaseCalled = true;
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .post('/api/inquiries')
        .set('Authorization', `Bearer ${createToken(7)}`)
        .send({
            customer_name: '',
            contact: 'Phone',
            subject: 'Coffee order',
            description: 'Customer inquiry'
        });

    assert.equal(response.status, 400);
    assert.match(response.body.message, /customer_name/);
    assert.equal(databaseCalled, false);
});

test('rejects whitespace-only customer names', async () => {
    let databaseCalled = false;

    const database = async () => {
        databaseCalled = true;
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .post('/api/inquiries')
        .set('Authorization', `Bearer ${createToken(7)}`)
        .send({
            customer_name: '   ',
            contact: 'Phone',
            subject: 'Coffee order',
            description: 'Customer inquiry'
        });

    assert.equal(response.status, 400);
    assert.match(response.body.message, /customer_name/);
    assert.equal(databaseCalled, false);
});

test('rejects an invalid inquiry status', async () => {
    let databaseCalled = false;

    const database = async () => {
        databaseCalled = true;
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .patch('/api/inquiries/42/status')
        .set('Authorization', `Bearer ${createToken(7)}`)
        .send({ status: 'Closed' });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Invalid status');
    assert.equal(databaseCalled, false);
});

test('rejects an invalid inquiry ID', async () => {
    let databaseCalled = false;

    const database = async () => {
        databaseCalled = true;
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .get('/api/inquiries/abc')
        .set('Authorization', `Bearer ${createToken(7)}`);

    assert.equal(response.status, 400);
    assert.equal(response.body.message, 'Invalid inquiry ID');
    assert.equal(databaseCalled, false);
});

test('rejects unauthenticated inquiry requests', async () => {
    let databaseCalled = false;

    const database = async () => {
        databaseCalled = true;
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .get('/api/inquiries');

    assert.equal(response.status, 401);
    assert.equal(response.body.message, 'Access token required');
    assert.equal(databaseCalled, false);
});

test('returns 404 when an inquiry does not exist', async () => {
    const database = async (sql, values) => {
        assert.match(sql, /id = \$1 AND created_by = \$2/);
        assert.deepEqual(values, [999, 7]);
        return { rows: [] };
    };

    const response = await request(createTestApp(database))
        .get('/api/inquiries/999')
        .set('Authorization', `Bearer ${createToken(7)}`);

    assert.equal(response.status, 404);
    assert.equal(response.body.message, 'Inquiry not found');
});
