import type { Server as HttpServer } from 'http';

import { WebSocketServer } from 'ws';

import { config } from '../config.js';
import { prisma } from '../db/client.js';
import { parseConnectCommand } from '../modules/network/commandParser.js';

type TerminalRequest = {
  type?: string;
  payload?: { command?: string };
};

export function registerWsGateway(server: HttpServer): void {
  const wss = new WebSocketServer({ server, path: config.wsPath });

  wss.on('connection', (socket) => {
    socket.send(
      JSON.stringify({
        type: 'system.ready',
        payload: { message: 'Terminal connected' },
      }),
    );

    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString()) as TerminalRequest;
        const command = data.payload?.command?.trim();

        if (data.type !== 'terminal.command' || !command) {
          socket.send(
            JSON.stringify({
              type: 'terminal.error',
              payload: { message: 'Invalid terminal request' },
            }),
          );
          return;
        }

        const connect = parseConnectCommand(command);
        if (!connect) {
          socket.send(
            JSON.stringify({
              type: 'terminal.output',
              payload: { line: `Unknown command: ${command}` },
            }),
          );
          return;
        }

        const target = await prisma.virtualComputer.findUnique({
          where: { dynamicIp: connect.ip },
          select: {
            id: true,
            hostname: true,
            dynamicIp: true,
            openPorts: true,
            owner: { select: { username: true } },
          },
        });

        if (!target) {
          socket.send(
            JSON.stringify({
              type: 'terminal.output',
              payload: { line: `connect ${connect.ip}: host unreachable` },
            }),
          );
          return;
        }

        socket.send(
          JSON.stringify({
            type: 'terminal.remote_state',
            payload: {
              connected: true,
              message: `Connected to ${target.hostname} (${target.dynamicIp})`,
              remote: {
                computerId: target.id,
                owner: target.owner.username,
                openPorts: target.openPorts,
              },
            },
          }),
        );
      } catch {
        socket.send(
          JSON.stringify({
            type: 'terminal.error',
            payload: { message: 'Malformed payload' },
          }),
        );
      }
    });
  });
}
