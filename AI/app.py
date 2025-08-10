from flask import Flask, request, jsonify
from nltk import word_tokenize, pos_tag
from nltk.corpus import stopwords
from transformers import GPT2Tokenizer, GPT2LMHeadModel, pipeline, set_seed
import google.generativeai as genai
import torch, textstat, re
import numpy as np
import os
import nltk
from joblib import load
from dotenv import load_dotenv
# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "ai_text_detection_model", "ai_detection_model.joblib")
clf = load(MODEL_PATH)

# Load GPT-2 tokenizer and model
tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
gpt2_model = GPT2LMHeadModel.from_pretrained("gpt2")
gpt2_model.eval()

# Load Gemini Api key into model
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Humanizer using text-generation model (can use gpt2 or distilgpt2)
humanizer = pipeline("text-generation", model="gpt2", tokenizer="gpt2")
set_seed(42)

# --- Utility Functions ---

def get_perplexity(text):
    try:
        encodings = tokenizer(text, return_tensors='pt', truncation=True, max_length=512)
        with torch.no_grad():
            output = gpt2_model(**encodings, labels=encodings['input_ids'])
        return torch.exp(output.loss).item()
    except:
        return 100.0

def extract_features(text):
    tokens = word_tokenize(text)
    pos = pos_tag(tokens)
    num_words = len(tokens) + 1
    stop_ratio = len([w for w in tokens if w.lower() in stop_words]) / num_words
    sent_len = len(tokens) / (text.count('.') + 1)
    reading = textstat.flesch_reading_ease(text)
    perplexity = get_perplexity(text)
    pos_tags = [tag for _, tag in pos]
    noun_ratio = pos_tags.count("NN") / num_words
    verb_ratio = pos_tags.count("VB") / num_words

    return [perplexity, reading, sent_len, stop_ratio, noun_ratio, verb_ratio]

def split_sentences(text):
    cleaned = re.sub(r'\s+', ' ', text.strip())
    sentences = re.split(r'[.!?]', cleaned)
    return [s.strip() for s in sentences if s.strip()]


def rewrite_sentence(sentence):
    # Aggressively refined prompt to get ONLY the single rewritten sentence
    prompt = (
        f"Rewrite the following sentence to sound more natural, personal, "
        f"and human-written. Provide ONLY the single rewritten sentence, "
        f"without any introductory phrases, explanations, multiple options, "
        f"or conversational filler. Ensure the rewritten sentence is a complete thought.\n\n"
        f"Original sentence: \"{sentence}\"\n\n"
        f"Rewritten sentence:"
    )

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        # Added temperature for a bit more creativity, which can help with naturalness
        response = model.generate_content(prompt, generation_config={"temperature": 0.7})

        rewritten_raw = response.text.strip()

        # --- START OF ROBUST POST-PROCESSING ---

        # 1. Remove common LLM introductory phrases, possibly followed by quotes
        rewritten = re.sub(
            r"^(Here's the rewritten sentence:|Rewritten sentence:|Here's one way to rewrite it:|Here's how I'd rewrite it:|Here's a rewritten version:|Here is the rewritten sentence:|I would rewrite it as:)?\s*[\"']?",
            "", rewritten_raw, flags=re.IGNORECASE
        ).strip()

        # 2. Remove trailing quotes if the LLM wrapped it in quotes
        if rewritten.endswith('"'):
            rewritten = rewritten[:-1].strip()

        # 3. If the LLM still provided multiple lines (e.g., options, explanations), take only the first one
        rewritten_lines = rewritten.split('\n')
        if rewritten_lines:
            rewritten = rewritten_lines[0].strip()
        else:
            rewritten = sentence # Fallback if no useful line is extracted

        # 4. Final cleanup: remove markdown bold/italic, collapse multiple spaces, remove blockquote symbols
        rewritten = re.sub(r'\*{1,2}', '', rewritten).strip() # Remove markdown bold/italic
        rewritten = re.sub(r' {2,}', ' ', rewritten) # Collapse multiple spaces
        rewritten = re.sub(r'>\s*', '', rewritten) # Remove blockquote character if any
        if len(rewritten) <= 5 or rewritten.lower() == sentence.lower():
            return sentence

        # --- END OF ROBUST POST-PROCESSING ---
        return rewritten
    except Exception as e:
        print(f"Rewrite error: {e}")
        return sentence # Fallback to original sentence on error


# --- API Route ---

@app.route("/check-ai/", methods=["POST"])
def detect_ai():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No input text provided"}), 400

    sentences = split_sentences(text)
    ai_sentences = []
    borderline_sentences = []
    results = []

    for sentence in sentences:
        features = extract_features(sentence)
        prob = clf.predict_proba([features])[0][1]

        label = "AI-Generated" if prob >= 0.65 else "Human-Written"
        if prob >= 0.65:
            ai_sentences.append(sentence)
        elif 0.4 < prob < 0.65:
            borderline_sentences.append(sentence)

        results.append({
            "sentence": sentence,
            "ai_probability": round(prob, 2),
            "label": label
        })

    ai_percentage = round(len(ai_sentences) / len(sentences) * 100, 2) if sentences else 0.0

    return jsonify({
        "total_sentences": len(sentences),
        "ai_sentences_count": len(ai_sentences),
        "ai_percentage": ai_percentage,
        "ai_sentences": ai_sentences,
        "borderline_sentences": borderline_sentences,
        "sentence_predictions": results
    })

@app.route("/humanize/", methods=["POST"])
def humanize_text():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No input text provided"}), 400

    sentences = [s.strip() for s in split_sentences(text) if s.strip()]
    ai_sentences = []
    rewritten_sentences = []

    for sentence in sentences:
        features = extract_features(sentence)
        prediction = clf.predict([features])[0]

        if prediction == 1:
            ai_sentences.append(sentence)

        rewritten = rewrite_sentence(sentence)
        rewritten_sentences.append(rewritten)

    return jsonify({
        "total_sentences": len(sentences),
        "ai_sentences_count": len(ai_sentences),
        "original_ai_sentences": ai_sentences,
        "modified_text": " ".join(s + "." for s in rewritten_sentences),
        "rewrites": [{"original": o, "rewritten": r} for o, r in zip(sentences, rewritten_sentences)]
    })

# Start the Flask app
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)