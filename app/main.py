from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import uvicorn

# =========================
# Création application FastAPI
# =========================
app = FastAPI()

# =========================
# Autoriser connexion frontend
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Charger modèle IA
# =========================
try:
    model = load_model("app/deepfake_model.h5")
    print("Modele charge avec succes")
except Exception as e:
    print("Erreur chargement modele :", e)
    model = None

# =========================
# Route principale
# =========================
@app.get("/")
def home():
    return {"message": "Backend Deepfake actif"}

# =========================
# Route upload image
# =========================
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    try:
        print("Image recue")

        # Lire image
        image = Image.open(file.file)

        print("Image ouverte")

        # Convertir en RGB
        image = image.convert("RGB")

        # Redimensionner image
        image = image.resize((224, 224))

        print("Image redimensionnee")

        # Convertir image en tableau numpy
        image_array = np.array(image)

        # Normaliser valeurs
        image_array = image_array / 255.0

        # Ajouter dimension batch
        image_array = np.expand_dims(image_array, axis=0)

        print("Prediction en cours...")

        # Vérifier si modèle chargé
        if model is None:
            return {
                "error": "Le modele IA n'est pas charge"
            }

        # Prediction
        prediction = model.predict(image_array)

        print("Prediction terminee")

        # Recuperer confiance
        confidence = float(prediction[0][0] * 100)

        # Resultat
        if confidence > 50:
            result = "FAKE"
        else:
            result = "REAL"

        print("Resultat :", result)
        print("Confiance :", confidence)

        # Retour JSON
        return {
            "prediction": result,
            "confidence": round(confidence, 2)
        }

    except Exception as e:
        print("ERREUR :", e)

        return {
            "error": str(e)
        }

# =========================
# Lancer serveur
# =========================
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)