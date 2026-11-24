'use strict';
// Mock tests: a fake fetch records requests. These do NOT call the live Whats360 API.
const test = require('node:test');
const assert = require('node:assert');
const { Whats360, Whats360Error } = require('./index');

function mock(status, body) {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return { ok: status < 400, status, text: async () => JSON.stringify(body) }; };
  return { calls, fetchImpl };
}

test('sendText builds the documented GET request', async () => {
  const m = mock(200, { success: true });
  const c = new Whats360({ token: 'T', instanceId: 'D', fetchImpl: m.fetchImpl });
  await c.sendText('201234567890@s.whatsapp.net', 'Hello');
  const u = new URL(m.calls[0].url);
  assert.strictEqual(u.origin + u.pathname, 'https://whats360.live/api/v1/send-text');
  assert.strictEqual(u.searchParams.get('token'), 'T');
  assert.strictEqual(u.searchParams.get('instance_id'), 'D');
  assert.strictEqual(u.searchParams.get('jid'), '201234567890@s.whatsapp.net');
  assert.strictEqual(u.searchParams.get('msg'), 'Hello');
  assert.strictEqual(m.calls[0].init.method, 'GET');
});

test('optional caption omitted when undefined', async () => {
  const m = mock(200, { success: true });
  const c = new Whats360({ token: 'T', instanceId: 'D', fetchImpl: m.fetchImpl });
  await c.sendImage('j', 'https://x/y.png');
  assert.strictEqual(new URL(m.calls[0].url).searchParams.has('caption'), false);
});

test('createCampaign POSTs JSON', async () => {
  const m = mock(200, { success: true });
  const c = new Whats360({ token: 'T', instanceId: 'D', fetchImpl: m.fetchImpl });
  await c.createCampaign({ name: 'test', message_content: 'Hello {{name}}' });
  assert.strictEqual(m.calls[0].init.method, 'POST');
  assert.deepStrictEqual(JSON.parse(m.calls[0].init.body), { name: 'test', message_content: 'Hello {{name}}' });
});

test('401 raises Whats360Error without leaking the token', async () => {
  const m = mock(401, { success: false, error: 'invalid token' });
  const c = new Whats360({ token: 'SECRET123', instanceId: 'D', fetchImpl: m.fetchImpl });
  await assert.rejects(() => c.listDevices(), (e) => e instanceof Whats360Error && e.status === 401 && !e.message.includes('SECRET123'));
});

test('device calls need instanceId', async () => {
  const c = new Whats360({ token: 'T', fetchImpl: mock(200, {}).fetchImpl });
  await assert.rejects(() => c.deviceStatus(), /instanceId is required/);
});
