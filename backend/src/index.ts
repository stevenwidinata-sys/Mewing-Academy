import { createApp } from './app';

const PORT = Number(process.env.PORT) || 4000;
// Local-only by default: no auth, so do not expose on the network.
const HOST = process.env.HOST || '127.0.0.1';

createApp().listen(PORT, HOST, () => {
  console.log(`Mewing Academy API on http://${HOST}:${PORT}`);
});
