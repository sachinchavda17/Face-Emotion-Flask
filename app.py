from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
from deepface import DeepFace
import json
import base64

app = Flask(__name__)

# Load Mood Messages
with open("mood_messages.json", "r", encoding="utf-8") as file:
    mood_messages = json.load(file)

# Load OpenCV Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def detect_face(image):
    """Detect faces in an image and draw bounding boxes."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5) # Method to find faces in the image

    if len(faces) == 0:
        return None, "No face detected! Please try again with a clear face photo."

    # Draw bounding box on detected face(s)
    for (x, y, w, h) in faces:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 3)

    return image, None

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

        # **Step 1: Detect face & draw bounding box**
        processed_image, error_message = detect_face(image)
        if error_message:
            return jsonify({"error": error_message}), 400

        # Convert processed image to Base64 for displaying in the UI
        _, buffer = cv2.imencode(".jpg", processed_image)
        processed_image_base64 = base64.b64encode(buffer).decode("utf-8")

        try:
            # **Step 2: Run DeepFace with enforce_detection=False**
            analysis = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
            predicted_emotion = analysis[0]['dominant_emotion']

            messages = mood_messages.get(predicted_emotion, {"messages": ["Stay positive!"], "activities": ["Take a deep breath"]})
            
            response = {
                "emotion": predicted_emotion.capitalize(),
                "message": messages["messages"][0],
                "activity": messages["activities"][0],
                "processed_image": processed_image_base64,  # Image with bounding box
            }
            return jsonify(response)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return jsonify({"error": "No image uploaded"}), 400

# Vercel needs this for serving the Flask app
def handler(event, context):
    return app(event, context)

if __name__ == "__main__":
    app.run(debug=True)
