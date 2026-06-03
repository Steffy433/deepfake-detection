import cv2
import os

video_path = "dataset/test.mp4"
output_folder = "dataset/frames"

os.makedirs(output_folder, exist_ok=True)

cap = cv2.VideoCapture(video_path)

count = 0

while True:
    ret, frame = cap.read()

    if not ret:
        break

    if count % 5 == 0:
        frame_path = os.path.join(output_folder, f"frame_{count}.jpg")
        cv2.imwrite(frame_path, frame)

    count += 1

cap.release()

print("Frames extraites :", count)
