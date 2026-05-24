#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required"
  exit 1
fi

psql "$DATABASE_URL" -f "$(dirname "$0")/schema.sql"
psql "$DATABASE_URL" -f "$(dirname "$0")/seed.sql"
