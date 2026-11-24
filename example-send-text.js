// WHATS360_TOKEN=... WHATS360_INSTANCE_ID=... node example-send-text.js 201234567890 "Hello"
// Sends ONE real message. Use your own number first.
const { Whats360 } = require('./index');
const [number, text] = process.argv.slice(2);
const c = new Whats360({ token: process.env.WHATS360_TOKEN, instanceId: process.env.WHATS360_INSTANCE_ID });
c.sendText(`${number}@s.whatsapp.net`, text).then(console.log, (e) => { console.error(e.message); process.exit(1); });
