const video = document.getElementById('video');
const statusMsg = document.getElementById('status-message');
const attendanceRows = document.getElementById('attendance-rows');

let markedStudents = new Set();

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model'),
    faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model'),
    faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/vladmandic/face-api/master/model')
]).then(startVideo);

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            statusMsg.innerText = "System Ready. Loading Database...";
        })
        .catch(err => {
            console.error("Camera Error: ", err);
            statusMsg.innerText = "Camera access denied!";
        });
}

video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    video.parentElement.append(canvas);

    let displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);

    const labeledFaceDescriptors = await loadLabeledImages();

    // ✅ Bug 3 Fix: filter out any students whose images failed to load
    const validDescriptors = labeledFaceDescriptors.filter(d => d !== null);

    if (validDescriptors.length === 0) {
        statusMsg.innerText = "No student data loaded. Check labeled_images folder.";
        return;
    }

    const faceMatcher = new faceapi.FaceMatcher(validDescriptors, 0.6);

    statusMsg.innerText = "Scanning Active";
    statusMsg.style.background = "rgba(34, 197, 94, 0.2)";

    window.addEventListener('resize', () => {
        displaySize = { width: video.clientWidth, height: video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);
    });

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

        displaySize = { width: video.clientWidth, height: video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);

        resizedDetections.forEach(detection => {
            const result = faceMatcher.findBestMatch(detection.descriptor);
            const folderName = result.label;

            if (folderName !== 'unknown' && !markedStudents.has(folderName)) {
                markAttendance(folderName);
            }
        });
    }, 700);
});

async function loadLabeledImages() {
    // ✅ Bug 2 Fix: load student list from a config file
    let labels;
    try {
        const response = await fetch('students.json');
        labels = await response.json();
        console.log(`Loaded ${labels.length} students from students.json`);
    } catch (e) {
        console.error("Could not load students.json:", e);
        statusMsg.innerText = "Error: students.json not found!";
        return [];
    }

    return Promise.all(
        labels.map(async label => {
            const descriptions = [];

            // ✅ Bug 1 Fix: try loading up to 5 images per student
            for (let i = 1; i <= 5; i++) {
                try {
                    const imgPath = `labeled_images/${label}/${i}.jpeg`;
                    console.log(`Loading: ${imgPath}`);

                    const img = await faceapi.fetchImage(imgPath);
                    const detections = await faceapi.detectSingleFace(img)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (detections) {
                        descriptions.push(detections.descriptor);
                        console.log(`Successfully trained: ${label} image ${i}`);
                    } else {
                        console.warn(`Face not clear in: ${imgPath}`);
                    }
                } catch (e) {
                    // Missing image file — stop trying more for this student
                    console.log(`No more images for ${label} after ${i - 1}`);
                    break;
                }
            }

            // ✅ Bug 3 Fix: skip students with no valid face images
            if (descriptions.length === 0) {
                console.warn(`No valid faces found for ${label}, skipping.`);
                return null;
            }

            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

function markAttendance(folderName) {
    markedStudents.add(folderName);

    const nameParts = folderName.split('_');
    const studentID = nameParts[0];
    const studentName = nameParts[1] || 'Student';

    const now = new Date();
    const timeString = now.toLocaleTimeString();

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${studentID}</strong></td>
        <td>${studentName}</td>
        <td><span class="badge-present">Present</span></td>
        <td>${timeString}</td>
    `;

    attendanceRows.insertBefore(row, attendanceRows.firstChild);

    statusMsg.innerText = `Attendance Marked for ${studentName}!`;
    statusMsg.style.background = "rgba(34, 197, 94, 0.4)";

    setTimeout(() => {
        statusMsg.innerText = "Scanning Active";
        statusMsg.style.background = "rgba(34, 197, 94, 0.2)";
    }, 3000);
}