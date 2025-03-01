const previewImage = document.getElementById("previewImage");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const webcamBtn = document.getElementById("webcamBtn");
const captureBtn = document.getElementById("captureBtn");
const webcamElement = document.getElementById("webcam");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const emotionText = document.getElementById("emotionText");
const messageText = document.getElementById("messageText");
const activityText = document.getElementById("activityText");

let latestImage = null;
let webcamActive = false;
let videoStream = null;

// 📌 Handle File Upload Preview
fileInput.addEventListener("change", function (event) {
  let file = event.target.files[0];
  let reader = new FileReader();

  reader.onload = function (e) {
    previewImage.src = e.target.result;
    previewImage.hidden = false;
    latestImage = file;
  };

  if (file) {
    reader.readAsDataURL(file);
  }

  resetResults();
});

// 📌 Toggle Webcam
webcamBtn.addEventListener("click", function () {
  if (!webcamActive) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        videoStream = stream;
        webcamElement.srcObject = stream;
        webcamElement.hidden = false;
        previewImage.hidden = true;

        webcamBtn.classList.add("hidden"); 
        captureBtn.classList.remove("hidden"); 

        webcamActive = true;
      })
      .catch(function (error) {
        alert("Webcam access denied.");
      });
  }
});

// 📌 Capture Image from Webcam
captureBtn.addEventListener("click", function () {
  let canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 384;
  canvas.getContext("2d").drawImage(webcamElement, 0, 0, 384, 384);

  let imageDataURL = canvas.toDataURL("image/jpeg");
  previewImage.src = imageDataURL;
  previewImage.hidden = false;
  webcamElement.hidden = true;

  // Stop Webcam Stream
  let tracks = videoStream.getTracks();
  tracks.forEach((track) => track.stop());

  webcamActive = false;
  webcamBtn.classList.remove("hidden"); 
  captureBtn.classList.add("hidden");

  latestImage = dataURItoBlob(imageDataURL);
  resetResults();
});

// 📌 Convert Data URI to Blob
function dataURItoBlob(dataURI) {
  let byteString = atob(dataURI.split(",")[1]);
  let mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  let arrayBuffer = new ArrayBuffer(byteString.length);
  let uintArray = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uintArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}

// 📌 Handle Prediction
uploadBtn.addEventListener("click", function () {
  let formData = new FormData();

  if (latestImage instanceof File) {
    formData.append("image", latestImage);
  } else if (latestImage instanceof Blob) {
    formData.append("image", latestImage, "captured_image.jpg");
  } else {
    alert("Please select or capture an image first!");
    return;
  }

  loading.classList.remove("hidden");
  result.classList.add("hidden");

  fetch("/predict", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      loading.classList.add("hidden");

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        // **Update UI with detected face image**
        previewImage.src = "data:image/jpeg;base64," + data.processed_image;
        emotionText.textContent = data.emotion;
        messageText.textContent = data.message;
        activityText.textContent = data.activity;
        result.classList.remove("hidden");
      }
    })
    .catch((error) => {
      loading.classList.add("hidden");
      alert("Something went wrong!");
      console.error(error);
    });
});

// 📌 Reset Result Display
function resetResults() {
  result.classList.add("hidden");
}
