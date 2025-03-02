# Face Emotion Detection APP

## Overview

This is a Flask-based API for detecting facial emotions in images using DeepFace. The API accepts an image and returns the detected emotion classification.

## Features

- Accepts image input via a POST request
- Uses DeepFace for real-time emotion detection
- Supports seven emotions: **Angry, Disgust, Fear, Happy, Sad, Surprise, Neutral**
- JSON response with predicted emotion

## Technologies Used

- **Flask** (Backend API)
- **DeepFace** (Emotion Detection Model)
- **OpenCV** (Image Processing)
- **TensorFlow/Keras** (Deep Learning)
- **Pandas, NumPy, Requests** (Data Handling)

## Requirements

- **Python 3.10.11 or similer**

## Installation

# Clone the repository
```bash
git clone https://github.com/sachinchavda17/Face-Emotion-Flask.git
cd Face-Emotion-Flask
```

# Install dependencies
```bash
pip install -r requirements.txt
```

## Running the API

```bash
python app.py
```

The server runs on `http://127.0.0.1:5000/`

## API Endpoints

### 1. **Emotion Detection**

#### **POST /predict**

- **Request:** Image file (`multipart/form-data`)
- **Response:** JSON with predicted emotion

#### Example Request

```bash
curl -X POST "http://127.0.0.1:5000/predict" \
     -F "image=@test.jpg"
```

#### Example Response

```json
{
  "emotion": "Happy"
}
```

## Deployment

### Local Server

Run the Flask app locally:

```bash
python app.py
```

## Model Accuracy

DeepFace's emotion detection model is trained on **FER2013 & KDEF datasets** with an estimated accuracy of **60-70%**. Emotions like **Happy** and **Neutral** are more accurately detected than **Disgust** and **Fear**.

## Future Improvements

- Fine-tune the model with custom datasets
- Improve accuracy with data augmentation
- Deploy on cloud with GPU acceleration

## Author

**Sachin Chavda**\
GitHub: [sachinchavda17](https://github.com/sachinchavda17)

