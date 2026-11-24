# whats360.live Node.js SDK (WhatsApp API for Node.js)

Small, dependency-free Node.js client (Node 18+) for the [whats360.live](https://whats360.live) WhatsApp API: send text, image, video, audio and documents, manage devices, run campaigns.

```js
const { Whats360 } = require('./index');
const w = new Whats360({ token: process.env.WHATS360_TOKEN, instanceId: process.env.WHATS360_INSTANCE_ID });
await w.sendText('201234567890@s.whatsapp.net', 'Hello');
```

Methods: `sendText, sendImage, sendVideo, sendAudio, sendDoc, listDevices, createDevice, connectDevice, deviceStatus, deviceQr, disconnectDevice, deleteDevice, listCampaigns, createCampaign, addRecipients, startCampaign, pauseCampaign, resumeCampaign, stopCampaign, campaignStatus, deleteCampaign`.

Errors throw `Whats360Error` with `.status` and `.body`. See [error codes](https://github.com/whats360-api/whats360-api-docs/blob/main/errors.md), including 463.

## Tests
`npm test` runs mock tests with a fake fetch. They check request building and error handling. They do not call the live API, and no real message was sent in testing.

## Notes
- `disconnectDevice` and `deleteDevice` change device state. Test devices only.
- `addRecipients` body shape is not documented in the official source.
- Never commit your token. Docs: https://github.com/whats360-api/whats360-api-docs

WhatsApp: https://wa.me/whats360.live · Direct chat support: https://wa.me/201030741766 · info@whats360.live
