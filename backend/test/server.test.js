const assert = require('node:assert/strict');
const { after, test } = require('node:test');
const { createApp } = require('../server');

const servers = [];

async function request(app, path, options = {}) {
    const server = app.listen(0);
    servers.push(server);
    await new Promise((resolve) => server.once('listening', resolve));
    const { port } = server.address();
    return fetch(`http://127.0.0.1:${port}${path}`, options);
}

after(async () => {
    await Promise.all(servers.map((server) => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    })));
});

test('health endpoint reports readiness without requiring an AI key', async () => {
    const response = await request(createApp({ apiKey: '' }), '/health');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
});

test('rejects empty documentation before calling the provider', async () => {
    let called = false;
    const app = createApp({
        apiKey: 'test-key',
        fetchImpl: async () => { called = true; }
    });
    const response = await request(app, '/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationText: '  ' })
    });
    assert.equal(response.status, 400);
    assert.equal(called, false);
});

test('rejects text above the documented limit', async () => {
    const app = createApp({ apiKey: 'test-key', fetchImpl: async () => assert.fail('provider should not be called') });
    const response = await request(app, '/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationText: 'x'.repeat(12001) })
    });
    assert.equal(response.status, 413);
});

test('returns the provider explanation and keeps the model call on the backend', async () => {
    let providerRequest;
    const app = createApp({
        apiKey: 'test-key',
        fetchImpl: async (url, options) => {
            providerRequest = { url, options };
            return Response.json({
                choices: [{ message: { content: 'A clear explanation.\n\nA useful analogy.' } }]
            });
        }
    });
    const response = await request(app, '/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationText: '  Read this technical note.  ' })
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: 'A clear explanation.\n\nA useful analogy.' });
    assert.equal(providerRequest.url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(providerRequest.options.headers.Authorization, 'Bearer test-key');
    assert.equal(JSON.parse(providerRequest.options.body).messages[1].content, 'Read this technical note.');
});

test('returns a useful error when provider generation fails', async () => {
    const app = createApp({
        apiKey: 'test-key',
        fetchImpl: async () => Response.json({ error: { message: 'provider detail' } }, { status: 429 })
    });
    const response = await request(app, '/api/simplify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentationText: 'Some documentation.' })
    });
    assert.equal(response.status, 502);
    assert.match((await response.json()).error, /could not process/i);
});
