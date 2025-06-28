// Variable to store the classifier
let classifier;
// Video
let video;
let flippedVideo;
// Variables To store the classification result
let label = "";
let resultConfidence;
// Variable to control classification sending
let lastSent = "";


////////////

// Load the model first
function preload() {	
	// Cargar el modelo
	classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
    let canvas = createCanvas(320, 280);
	canvas.parent('sketch-container');
    // Create the video
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
	// Setup OSC interface
	setupOsc(12000, clientPort, clientIP);
}

///////////////////////////

function draw() {
    background(0);
    // Draw the video
    image(flippedVideo, 0, 0);

    // Draw the label
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width / 2, height - 24);

    // Draw the confidence
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(resultConfidence, width / 2, height - 4);
}

// Get a prediction for the current video frame
function classifyVideo() {
	flippedVideo = ml5.flipImage(video)
	classifier.classify(flippedVideo, gotResult);
	flippedVideo.remove();
}

// When we get a result
function gotResult(error, results) {
	// If there is an error
	if (error) {
	  console.error(error);
	  return;
	}
	// The results are in an array ordered by confidence.
	//console.log(results[0]);
	label = results[0].label;
	resultConfidence = results[0].confidence
	// Send via OSC
	// Ejecutar un comando OSC únicamente si se acerca un objeto (no vacío)
    // Si repeatRecognition es activado, enviará el Vacío también
	// confidenceThershold está definido en la librería auxiliar uiController.js
    if (repeatRecognition || label != "Vacio") {
        if (resultConfidence > confidenceThreshold && label != lastSent) {
            sendOsc('cue/' + getResultFromDict(label).replace(/\s/g, '') + '/go', resultConfidence);
            lastSent = label;
        }
    }
	// Classifiy again!
    classifyVideo();
}

// Función para obtener el valor del diccionario basado en el label
// resultDict está definido en la librería auxiiliar uiController.js
function getResultFromDict(label) {
    if (resultDict.hasOwnProperty(label)) {
        return resultDict[label]; // Devuelve el valor correspondiente al label
    } else {
        return "0"; // Default
    }
}