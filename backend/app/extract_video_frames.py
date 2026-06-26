import cv2
import os

def extract_frames(video_folder, output_folder, label):
    os.makedirs(output_folder, exist_ok=True)

    for video_name in os.listdir(video_folder):
        video_path = os.path.join(video_folder, video_name)

        cap = cv2.VideoCapture(video_path)
        count = 0
        saved = 0

        while True:
            ret, frame = cap.read()

            if not ret:
                break

            if count % 30 == 0:
                frame_name = f"{label}_{video_name}_{saved}.jpg"
                frame_path = os.path.join(output_folder, frame_name)
                cv2.imwrite(frame_path, frame)
                saved += 1

            count += 1

        cap.release()
        print(f"{video_name} : {saved} frames extraites")


extract_frames(
    "video_dataset/real",
    "frames_dataset/real",
    "real"
)

extract_frames(
    "video_dataset/fake",
    "frames_dataset/fake",
    "fake"
)