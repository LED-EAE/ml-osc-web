// Global variable to store theclassifier
let classifier;
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/sFYk-WB-_/';
  
// Video
let video;
let flippedVideo;
// To store the classification
let label = "";

// Setup a confidence Threshod so that not all the messages are sent via OSC
var resultConfidence;
var confidenceThreshold = 0.80;
var lastSent = "";


////////////
// Load the model first
function preload() {
classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
    let canvas = createCanvas(320, 260);
	canvas.parent('sketch-container');
    // Create the video
    video = createCapture(VIDEO);
    video.size(320, 240);
    video.hide();

    flippedVideo = ml5.flipImage(video);
    // Start classifying
    classifyVideo();
	// Setup OSC interface
	setupOsc(12000, 3333);
}

function draw() {
    background(0);
    // Draw the video
    image(flippedVideo, 0, 0);

    // Draw the label
    fill(255);
    textSize(16);
    textAlign(CENTER);
    text(label, width / 2, height - 4);
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
	console.log(results[0]);
	label = results[0].label;
	resultConfidence = results[0].confidence
	// Send via OSC
	if(resultConfidence > confidenceThreshold && label != lastSent){
		sendOsc(label.replace(/\s/g, ''), results[0].confidence);
		lastSent =label;
	}
	// Classifiy again!
    classifyVideo();
}
