import http from 'http';

import express from 'express';

import { config } from './config.js';
import { registerWsGateway } from './realtime/wsGateway.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mmo-hack-server' });
});

const server = http.createServer(app);
registerWsGateway(server);

server.listen(config.port, () => {
  console.log(`HTTP/WS server listening on :${config.port}`);
});
