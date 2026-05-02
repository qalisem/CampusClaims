#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found. Copy .env.example to .env.local and fill it in."
  exit 1
fi
if [ ! -f supabase/.env ]; then
  echo "ERROR: supabase/.env not found. Copy supabase/.env.example to supabase/.env and fill it in."
  exit 1
fi

docker compose up -d --build
echo
echo "CampusClaims is starting."
echo "App:      http://localhost:3000"
echo "Supabase: http://localhost:8000"
