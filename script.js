// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

// get user-image element and context
const canvas = document.getElementById("user-image");
const context = canvas.getContext("2d");

// initialize button variables
const btnRead = document.querySelector("[type='button']");
const btnClear = document.querySelector("[type='reset']");
const btnGenerate = document.querySelector("[type='submit']");

// initialize related page component variables
const inputImage = document.getElementById("image-input");
const generateMeme = document.getElementById("generate-meme");
const volumeGroup = document.getElementById("volume-group");
const voiceSelection = document.getElementById("voice-selection");

// speech synthesis variable initialization
const speechSynth = window.speechSynthesis;
let speechVoices = [];
let speechVolume = document.querySelector("[type='range']").value / 100;

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected

  // using the canvas height and width variables, clear the canvas context
  context.clearRect(0, 0, canvas.width, canvas.height);

  // toggle button states into their appropriate configurations
  btnRead.disabled = true;
  btnClear.disabled = true;
  btnGenerate.disabled = false;

  // populate canvas context with black coloring
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // get canvas and image dimensions
  let dimensions = getDimmensions(canvas.width, canvas.height, img.width, img.height);

  // draw input image on canvas
  context.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

});

inputImage.addEventListener('change', () => {
  // load input image and set text alternative for image
  img.src = URL.createObjectURL(inputImage.files[0]);
  img.alt = inputImage.files[0].name;
});

generateMeme.addEventListener('submit', (evt) => {
  evt.preventDefault();

  // get top and bottom text fields
  let textTop = document.getElementById("text-top").value;
  let textBottom = document.getElementById("text-bottom").value;

  // set text context parameters
  context.font = "30px Impact"
  context.fillStyle = "white";
  context.textAlign = "center";

  // draw top and bottom text fields
  context.fillText(textTop, canvas.width/2, 50);
  context.fillText(textBottom, canvas.width/2, canvas.height-50);

  // re-toggle buttons
  btnRead.disabled = false;
  btnClear.disabled = false;
  btnGenerate.disabled = true;
});

btnClear.addEventListener("click", () => {
  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // re-toggle buttons
  btnRead = true;
  btnClear = true;
  btnGenerate = false;
});

btnRead.addEventListener("click", () => {
  // combine top and bottom text fields
  let textCombined = document.getElementById("text-top").value + " " + document.getElementById("text-bottom").value;

  // set speech synthesis details
  let speech = new SpeechSynthesisUtterance(textCombined);
  speech.voice = speechVoices[voiceSelection.selectedOptions[0].getAttribute("voices-idx")];
  speech.volume = speechVolume;
  speechSynth.speak(speech);
});

/*
 * function to populate the voice list
 * code adaptation based on example from: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 */
function populateVoiceList() {
  const voices = speechSynth.getVoices();
  voiceSelection.remove(0); // remove "No available voice options"
  
  for (let voice = 0; voice < voices.length; voice++) {
    let voiceChoice = document.createElement("option");
    voiceChoice.textContent = voices[voice].name + " (" + voices[voice].lang + ")";

    if (voices[voice].default) {
      voiceChoice.textContent += " -- [DEFAULT]";
    }

    voiceChoice.setAttribute("voices-idx", voice);
    voiceChoice.setAttribute("data-name", voices[voice].name);
    voiceChoice.setAttribute("data-lang", voices[voice].lang);
    
    voiceSelection.appendChild(voiceChoice);
  }
  voiceSelection.disabled = false;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

volumeGroup.addEventListener("input", () => {
  let vol = document.querySelector("[type='range']").value;
  speechVolume = vol / 100;

  let volIcon = document.querySelectorAll("img")[0];

  if (vol == 0) {
    volIcon.src = "icons/volume-level-0.svg";
  }

  else if (vol <= 33) {
    volIcon.src = "icons/volume-level-1.svg";
  }

  else if (vol <= 66) {
    volIcon.src = "icons/volume-level-2.svg";
  }

  else {
    volIcon.src = "icons/volume-level-3.svg";
  }
});

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}