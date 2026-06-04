# 🤖 AI-Powered Smart Attendance System

A cutting-edge, web-based **Smart Attendance System** featuring a beautiful **Glassmorphic UI**. This application utilizes **Face-API.js** (built on top of TensorFlow.js) to perform real-time facial recognition directly in the browser via the webcam, mapping faces to student IDs and automatically logging attendance.

---

## ✨ Features
* **Real-time Face Detection & Recognition:** High-speed scanning using lightweight AI models.
* **Automated Attendance Logging:** Instantly detects the student and adds them to the log table with their ID, Name, and Timestamp.
* **Modern Glassmorphic UI:** Sleek, futuristic translucent design elements with smooth glowing background animations.
* **No Database Required (Client-Side):** Works entirely in the browser using local labeled image directories.
* **Dynamic Folder Mapping:** Automatically splits directory names (e.g., `ST001_Sandaru`) to extract Student IDs and Names dynamically.

---

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3 (Advanced Flexbox, Backdrop Filters, Gradients)
* **Core Logic:** JavaScript (ES6+, Promises, Async/Await)
* **AI Engine:** [Face-API.js](https://github.com/vladmandic/face-api) (Tiny Face Detector, Face Landmark, Face Recognition models)

---

## 📁 Directory Structure
```text
face-attendance/
│
├── index.html          # Main application layout
├── style.css           # Glassmorphism styling & animations
├── script.js          # Webcam handling, model loading & face matching logic
├── .gitignore          # Prevents personal photos from being uploaded
└── labeled_images/     # Database folder containing student records
    ├── ST001_Sandaru/
    │   └── 1.jpeg      # Clear face image of the student
    └── ST002_Nirmal/
        └── 1.jpeg