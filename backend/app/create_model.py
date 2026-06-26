import os
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# =========================
# Chemins
# =========================
DATASET_PATH = "backend/frames_dataset"
MODEL_PATH = "app/deepfake_model.h5"

# =========================
# Prétraitement des images
# =========================
datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    validation_split=0.2
)

train_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(224, 224),
    batch_size=16,
    class_mode="binary",
    subset="training"
)

val_data = datagen.flow_from_directory(
    DATASET_PATH,
    target_size=(224, 224),
    batch_size=16,
    class_mode="binary",
    subset="validation"
)

# Afficher les classes
print("Classes détectées :", train_data.class_indices)

# =========================
# Modèle CNN
# =========================
model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(224,224,3)),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Conv2D(128, (3,3), activation="relu"),
    MaxPooling2D(2,2),

    Flatten(),

    Dense(128, activation="relu"),
    Dropout(0.5),

    Dense(1, activation="sigmoid")
])

# Compilation
model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# Entraînement
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=10
)

history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=10
)

# =========================
# Modèle CNN
# =========================
model = Sequential([
    Conv2D(32, (3, 3), activation="relu", input_shape=(224, 224, 3)),
    MaxPooling2D(2, 2),

    Conv2D(64, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Conv2D(128, (3, 3), activation="relu"),
    MaxPooling2D(2, 2),

    Flatten(),

    Dense(128, activation="relu"),
    Dropout(0.5),

    Dense(1, activation="sigmoid")
])

# =========================
# Compilation
# =========================
model.compile(
    optimizer="adam",
    loss="binary_crossentropy",
    metrics=["accuracy"]
)

# =========================
# Entraînement
# =========================
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=10
)

# =========================
# Sauvegarde du modèle
# =========================
model.save(MODEL_PATH)

print("Modèle CNN entraîné et sauvegardé :", MODEL_PATH)