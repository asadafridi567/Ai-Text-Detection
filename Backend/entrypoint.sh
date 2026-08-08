#!/bin/sh
set -e

echo "Waiting for database to be ready..."
python - <<'PYEOF'
import os
import sys
import time
from urllib.parse import urlparse
import psycopg2

db_url = os.getenv("DATABASE_URL")
if not db_url:
    print("DATABASE_URL not set, skipping DB wait.")
    sys.exit(0)

parsed = urlparse(db_url)
for attempt in range(30):
    try:
        conn = psycopg2.connect(
            dbname=parsed.path.lstrip("/"),
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port or 5432,
        )
        conn.close()
        print("Database is ready.")
        break
    except Exception as e:
        print(f"Database not ready yet ({attempt + 1}/30): {e}")
        time.sleep(2)
else:
    print("Database never became ready after 30 attempts, continuing anyway "
          "(migrate will surface the real error if it's still unreachable).")
PYEOF

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || echo "collectstatic skipped/failed, continuing."

echo "Starting Gunicorn..."
exec gunicorn home.wsgi:application --bind 0.0.0.0:8000