import os
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Debug check
print("🔑 API key loaded?", "YES" if API_KEY else "NO")

# Configure Gemini
genai.configure(api_key=API_KEY)

# Flask setup
app = Flask(__name__)
CORS(app)

# === Text-only chat ===
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    print("📩 Received:", message)

    try:
        # Use the correct Gemini model
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(
            f"You are an AI tutor. Always explain step by step.\nStudent: {message}"
        )
        reply = response.text if response.text else "(no reply from AI)"
        print("✅ Gemini reply:", reply)
        return jsonify({"reply": reply})
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

# === Image + question chat ===
@app.route("/chat-image", methods=["POST"])
def chat_image():
    question = request.form.get("question", "Please explain this image")
    image_file = request.files["image"]

    try:
        # Convert image to base64
        image_bytes = image_file.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Use the same model for vision input
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(
            [question, {"mime_type": image_file.mimetype, "data": image_base64}]
        )
        reply = response.text if response.text else "(no reply from AI)"
        print("✅ Gemini vision reply:", reply)
        return jsonify({"reply": reply})
    except Exception as e:
        print("❌ Vision error:", e)
        return jsonify({"error": str(e)}), 500

# === Default test route ===
@app.route("/")
def home():
    return "✅ AI Tutor Flask Backend is running!"

if __name__ == "__main__":
    app.run(port=5000, debug=True)
