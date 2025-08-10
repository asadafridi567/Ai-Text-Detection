FROM python:3.11-slim AS build

# Set working directory inside container
WORKDIR /app

# Install system dependencies needed for building some Python packages
RUN apt-get update && apt-get install -y gcc libffi-dev && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .

# Upgrade pip first
RUN pip install --upgrade pip

# Install torch explicitly (CPU version), then install rest of requirements
RUN pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Download nltk data
RUN python -m nltk.downloader punkt averaged_perceptron_tagger stopwords

# Copy environment file
COPY .env .

# Copy model and application code
COPY ai_text_detection_model/ ai_text_detection_model/
COPY app.py .

# Expose the Flask API port
EXPOSE 5000

# Start the Flask app
CMD ["python", "app.py"]