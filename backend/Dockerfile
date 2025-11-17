# backend/Dockerfile
FROM python:3.11-slim

# системные зависимости (если нужны сборки psycopg2-binary, но psycopg2-binary не требует build deps)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev curl \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/ ./backend

# копируем только requirements (чтобы кэшировать)
COPY backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# копируем весь бекенд
COPY backend/ ./

# делаем entrypoint исполняемым
COPY backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8002

# запускаем entrypoint (alembic migration then uvicorn)
ENTRYPOINT [ "entrypoint.sh" ]
