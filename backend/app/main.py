from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import uvicorn
import cv2
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = load_model("app/deepfake_model.h5")
    print("Modele charge avec succes")
except Exception as e:
    print("Erreur chargement modele :", e)
    model = None


@app.get("/")
def home():
    return {"message": "Backend Deepfake actif"}


def predict_image(image):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(image_array, verbose=0)
    confidence = float(prediction[0][0] * 100)

    return confidence


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if model is None:
            return {"error": "Modele non charge"}

        if file.content_type.startswith("image"):
            image = Image.open(file.file)

            confidence = predict_image(image)
            result = "FAKE" if confidence > 50 else "REAL"

            return {
                "type": "image",
                "prediction": result,
                "confidence": round(confidence, 2)
            }

        elif file.content_type.startswith("video"):
            os.makedirs("temp", exist_ok=True)

            video_path = os.path.join("temp", file.filename)

            with open(video_path, "wb") as buffer:
                buffer.write(await file.read())

            cap = cv2.VideoCapture(video_path)

            scores = []
            frame_count = 0

            while True:
                success, frame = cap.read()

                if not success:
                    break

                if frame_count % 30 == 0:
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    image = Image.fromarray(frame_rgb)

                    score = predict_image(image)
                    scores.append(score)

                frame_count += 1

            cap.release()

            if os.path.exists(video_path):
                os.remove(video_path)

            if len(scores) == 0:
                return {"error": "Impossible de lire la video"}

            confidence = sum(scores) / len(scores)
            result = "FAKE" if confidence > 50 else "REAL"

            return {
                "type": "video",
                "prediction": result,
                "confidence": round(confidence, 2),
                "frames_analysees": len(scores)
            }

        else:
            return {"error": "Format non supporte"}

    except Exception as e:
        print("ERREUR :", e)
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)