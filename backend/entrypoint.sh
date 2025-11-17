#!/usr/bin/env bash
set -e

host=${POSTGRES_HOST:-db}
port=${POSTGRES_PORT:-5432}
max_tries=30
i=0

until python - <<PY > /dev/null 2>&1
import os, sys
import psycopg2
try:
    psycopg2.connect(os.environ.get("DATABASE_URL"))
    sys.exit(0)
except Exception:
    sys.exit(1)
PY
do
  i=$((i+1))
  if [ $i -ge $max_tries ]; then
    echo "Postgres did not become available in time"
    exit 1
  fi
  echo "Waiting for Postgres... ($i/$max_tries)"
  sleep 1
done

# Миграции Alembic
if [ -f "./alembic.ini" ]; then
  echo "Running alembic upgrade head"
  alembic upgrade head
fi

# Запуск FastAPI
exec uvicorn backend.main:app --host 0.0.0.0 --port 8002 --reload
