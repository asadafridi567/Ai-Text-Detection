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

# Set the working directory inside the container to the Backend folder
# This is a key change to fix the 'can't chdir' error.
WORKDIR /app/Backend

# Copy only the necessary files from the build-env stage
# This ensures a clean and minimal image.
COPY --from=build-env /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=build-env /usr/local/bin/ /usr/local/bin/
COPY . .

# Add the parent working directory to the Python path
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Set environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=Backend.home.settings

# Expose port 8000 for the app
EXPOSE 8000

# Run Gunicorn server to serve your Django app from the current directory
CMD ["gunicorn", "home.wsgi:application", "--bind", "0.0.0.0:8000"]