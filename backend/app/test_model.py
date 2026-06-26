from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np

# Charger le modèle
model = load_model("deepfake_model.h5")

# Image à tester
img_path = "test.jpg"

img = image.load_img(img_path, target_size=(224, 224))
img = image.img_to_array(img)
img = img / 255.0
img = np.expand_dims(img, axis=0)

prediction = model.predict(img)[0][0]

print("Score :", prediction)

if prediction > 0.5:
    print("REAL")
else:
    print("FAKE")