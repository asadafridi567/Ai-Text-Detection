FROM python:3.11-slim as build-env

# Set working directory
WORKDIR /app

# Install system dependencies needed for building some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Stage 2: Final application image ---
FROM python:3.11-slim

# Install runtime dependencies required by weasyprint and other binary packages
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf-2.0-0 \
    libglib2.0-0 \
    libgirepository-1.0-1 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container to the Backend folder
# This is a key change to fix the 'can't chdir' error.
WORKDIR /app/Backend

# Copy only the necessary files from the build-env stage
# This ensures a clean and minimal image.
COPY --from=build-env /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=build-env /usr/local/bin/ /usr/local/bin/
COPY . .

# Entrypoint script: waits for the DB, then runs migrations and
# collectstatic before starting Gunicorn. Runs at container *startup*,
# not build time, since postgres/redis aren't reachable during `docker
# build` (they're separate containers that only exist once the whole
# compose stack is actually running).
COPY entrypoint.sh /app/Backend/entrypoint.sh
RUN chmod +x /app/Backend/entrypoint.sh

# Add the parent working directory to the Python path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Set environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=Backend.home.settings

# Expose port 8000 for the app
EXPOSE 8000

# Run migrations, then start Gunicorn to serve the Django app
ENTRYPOINT ["/app/Backend/entrypoint.sh"]