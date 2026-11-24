'use strict';
// Whats360 API client. Covers only endpoints in the official reference.
// Uses the global fetch (Node 18+). No dependencies.

class Whats360Error extends Error {
  constructor(message, status, body) { super(message); this.name = 'Whats360Error'; this.status = status; this.body = body; }
}

class Whats360 {
  constructor({ token, instanceId, baseUrl = 'https://whats360.live/api/v1', fetchImpl } = {}) {
    if (!token) throw new Error('token is required');
    this.token = token;
    this.instanceId = instanceId;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetch = fetchImpl || globalThis.fetch;
  }

  async _call(method, path, params = {}, body) {
    const q = new URLSearchParams({ token: this.token });
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) q.set(k, String(v));
    const init = { method };
    if (body !== undefined) { init.headers = { 'Content-Type': 'application/json' }; init.body = JSON.stringify(body); }
    const res = await this.fetch(`${this.baseUrl}${path}?${q}`, init);
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok || data.success === false) {
      // Never include the token in error text.
      throw new Whats360Error(data.error || `HTTP ${res.status}`, res.status, data);
    }
    return data;
  }

  _inst(extra = {}) {
    if (!this.instanceId) throw new Error('instanceId is required for this call');
    return { instance_id: this.instanceId, ...extra };
  }

  // Messages
  sendText(jid, msg) { return this._call('GET', '/send-text', this._inst({ jid, msg })); }
  sendImage(jid, imageurl, caption) { return this._call('GET', '/send-image', this._inst({ jid, imageurl, caption })); }
  sendVideo(jid, videourl, caption) { return this._call('GET', '/send-video', this._inst({ jid, videourl, caption })); }
  sendAudio(jid, audiourl) { return this._call('GET', '/send-audio', this._inst({ jid, audiourl })); }
  sendDoc(jid, docurl, caption) { return this._call('GET', '/send-doc', this._inst({ jid, docurl, caption })); }

  // Devices
  listDevices() { return this._call('GET', '/instances'); }
  createDevice(id, name) { return this._call('GET', '/instances/create', { id, name }); }
  connectDevice() { return this._call('GET', '/instances/connect', this._inst()); }
  deviceStatus() { return this._call('GET', '/instances/status', this._inst()); }
  deviceQr() { return this._call('GET', '/instances/qr', this._inst()); }
  disconnectDevice() { return this._call('GET', '/instances/disconnect', this._inst()); } // changes device state
  deleteDevice() { return this._call('GET', '/instances/delete', this._inst()); } // destructive

  // Campaigns
  listCampaigns() { return this._call('GET', '/campaigns', this._inst()); }
  createCampaign(body) { return this._call('POST', '/campaigns/create', this._inst(), body); } // e.g. {name, message_content}
  addRecipients(campaignId, body) { return this._call('POST', '/campaigns/recipients', this._inst({ campaign_id: campaignId }), body); } // body shape undocumented
  startCampaign(campaignId) { return this._call('POST', '/campaigns/start', this._inst({ campaign_id: campaignId })); }
  pauseCampaign(campaignId) { return this._call('POST', '/campaigns/pause', this._inst({ campaign_id: campaignId })); }
  resumeCampaign(campaignId) { return this._call('POST', '/campaigns/resume', this._inst({ campaign_id: campaignId })); }
  stopCampaign(campaignId) { return this._call('POST', '/campaigns/stop', this._inst({ campaign_id: campaignId })); }
  campaignStatus(campaignId) { return this._call('GET', '/campaigns/status', this._inst({ campaign_id: campaignId })); }
  deleteCampaign(campaignId) { return this._call('POST', '/campaigns/delete', this._inst({ campaign_id: campaignId })); }
}

// Make every public method return a promise, even when validation throws.
for (const name of Object.getOwnPropertyNames(Whats360.prototype)) {
  if (name === 'constructor' || name.startsWith('_')) continue;
  const fn = Whats360.prototype[name];
  Whats360.prototype[name] = async function (...a) { return fn.apply(this, a); };
}

module.exports = { Whats360, Whats360Error };
