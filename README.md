# mmo-code

Monorepo scaffold for an Android MMO hacking simulator inspired by Grey Hack.

## Structure

- `./client` - Flutter Android client (APK target)
- `./server` - Node.js + TypeScript backend (REST + WebSocket + PostgreSQL)
- `./.devcontainer` - GitHub Codespaces cloud dev environment

## Backend quick start (Codespaces)

1. Open this repository in GitHub Codespaces.
2. Wait for `.devcontainer/scripts/postCreate.sh` to finish.
3. Start PostgreSQL locally for dev:
   - `cd server`
   - `docker compose up -d postgres`
4. Configure env file:
   - `cp .env.example .env`
5. Run migrations and seed (after creating migration files):
   - `cd server`
   - `npx prisma generate --schema src/db/prisma/schema.prisma`
6. Start backend server:
   - `cd server`
   - `npm run dev`

Backend listens on `8080`, WebSocket path `/ws`.

## Android/Phone connection in Codespaces

1. In Codespaces Ports panel, set port `8080` visibility to **Public** (or authenticated private as needed).
2. Copy the forwarded HTTPS URL for port `8080`.
3. In the app client, point WebSocket URL to `wss://<forwarded-host>/ws`.
4. For emulator/device testing, ensure phone/emulator can reach the forwarded URL and that auth policy permits access.

## Initial WebSocket command flow

Client sends:

```json
{
  "type": "terminal.command",
  "payload": { "command": "connect 10.10.0.2" }
}
```

Server responds with `terminal.remote_state` when host exists, otherwise an error/output line.

## Notes

- `server/Dockerfile` is production-oriented for cloud deploy (Render/Fly.io).
- `server/docker-compose.yml` is local-development oriented.
- `.devcontainer/*` is Codespaces-only setup.
