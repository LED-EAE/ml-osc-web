// Global variable to store the classifier
let classifier;

// Label (start by showing listening)
let label = "listening";

// Teachable Machine model URL:
let soundModelURL = 'https://teachablemachine.withgoogle.com/models/z9o-4gFSP/';

// Setup a confidence Threshod so that not all the messages are sent via OSC
var resultConfidence;
var confidenceThreshold = 0.80;
var lastSent = "";


////////////

function preload() {
	// Load the model
	classifier = ml5.soundClassifier(soundModelURL + 'model.json');
}

function setup() {
	let canvas = createCanvas(320, 240);
	canvas.parent('sketch-container');
	// Start classifying
	// The sound model will continuously listen to the microphone
	classifier.classifyStart(gotResult);
	// Setup OSC interface
	setupOsc(12000, 3333);
}

function draw() {
	background(0);
	// Draw the label in the canvas
	fill(255);
	textSize(32);
	textAlign(CENTER, CENTER);
	text(label, width / 2, height / 2);
}

// The model recognizing a sound will trigger this event
function gotResult(results) {
	// The results are in an array ordered by confidence.
	console.log(results[0]);
	label = results[0].label;
	resultConfidence = results[0].confidence
	// Send via OSC
	if(resultConfidence > confidenceThreshold && label != lastSent){
		sendOsc(label.replace(/\s/g, ''), results[0].confidence);
		lastSent =label;
	}
}