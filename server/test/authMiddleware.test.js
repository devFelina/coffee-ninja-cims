const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'test-secret-for-auth-tests';

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');

function runMiddleware(token) {
    return new Promise((resolve) => {
        const req = {
            headers: token
                ? { authorization: `Bearer ${token}` }
                : {}
        };

        let statusCode;

        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(body) {
                resolve({
                    statusCode,
                    body,
                    nextCalled: false,
                    req
                });
            }
        };

        authenticateToken(req, res, () => {
            resolve({
                nextCalled: true,
                req
            });
        });
    });
}

function runMiddlewareWithHeader(authorization) {
    return new Promise((resolve) => {
        const req = {
            headers: { authorization }
        };

        let statusCode;

        const res = {
            status(code) {
                statusCode = code;
                return this;
            },
            json(body) {
                resolve({ statusCode, body });
            }
        };

        authenticateToken(req, res, () => {
            resolve({ nextCalled: true, req });
        });
    });
}

test('rejects requests without an access token', async () => {
    const result = await runMiddleware();

    assert.equal(result.statusCode, 401);
    assert.equal(result.body.message, 'Access token required');
});

test('rejects an invalid access token', async () => {
    const result = await runMiddleware('invalid-token');

    assert.equal(result.statusCode, 403);
    assert.equal(result.body.message, 'Invalid or expired token');
});

test('allows requests with a valid access token', async () => {
    const token = jwt.sign(
        { id: 7, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const result = await runMiddleware(token);

    assert.equal(result.nextCalled, true);
    assert.equal(result.req.user.id, 7);
    assert.equal(result.req.user.email, 'test@example.com');
});


test('rejects expired access tokens', async () => {
    const token = jwt.sign(
        { id: 7, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: -1 }
    );

    const result = await runMiddleware(token);

    assert.equal(result.statusCode, 403);
    assert.equal(result.body.message, 'Invalid or expired token');
});

test('rejects authorization headers using the wrong scheme', async () => {
    const token = jwt.sign(
        { id: 7, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    const result = await runMiddlewareWithHeader(`Basic ${token}`);

    assert.equal(result.statusCode, 401);
    assert.equal(result.body.message, 'Access token required');
});

