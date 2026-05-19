#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/mmo-code

if [ -f server/package.json ]; then
  cd server
  npm install
  npx prisma generate --schema src/db/prisma/schema.prisma || true
  cd ..
fi

if [ -f client/pubspec.yaml ]; then
  cd client
  flutter pub get || true
  cd ..
fi
