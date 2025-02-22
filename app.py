from flask import Flask, render_template, request, jsonify
import cv2
from deepface import DeepFace
from werkzeug.utils import secure_filename
import numpy as np
import json

app = Flask(__name__)

# Load Mood Messages
with open("mood_messages.json", "r", encoding="utf-8") as file:
    mood_messages = json.load(file)


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["image"]
    if file:
        # Convert file to numpy array
        np_img = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        try:
            # Perform emotion detection using DeepFace
            analysis = DeepFace.analyze(image, actions=['emotion'])
            predicted_emotion = analysis[0]['dominant_emotion']
            messages = mood_messages.get(predicted_emotion, {"messages": ["Stay positive!"], "activities": ["Take a deep breath"]})
            response = {
                "emotion": predicted_emotion.capitalize(),
                "message": messages["messages"][0],
                "activity": messages["activities"][0],
            }
            return jsonify(response)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "No image uploaded"}), 400

if __name__ == "__main__":
    app.run(debug=True)


