import cv2
import os

input_folder = "dataset/frames"
output_folder = "dataset/faces"

os.makedirs(output_folder, exist_ok=True)

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

for file in os.listdir(input_folder):

    path = os.path.join(input_folder, file)
    image = cv2.imread(path)

    if image is None:
        continue

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.1, 5)

    for i, (x, y, w, h) in enumerate(faces):
        face = image[y:y+h, x:x+w]
        face = cv2.resize(face, (224, 224))

        cv2.imwrite(os.path.join(output_folder, f"{file}_{i}.jpg"), face)

print("Visages extraits ✅")