FROM python:3.11-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m nltk.downloader punkt averaged_perceptron_tagger stopwords

# Copy environment file
COPY .env .  

# Copy model and application code
COPY ai_text_detection_model/ai_detection_model.joblib .
COPY app.py .

# Expose the Flask API port
EXPOSE 5000

# Start the Flask app
CMD ["python", "app.py"]