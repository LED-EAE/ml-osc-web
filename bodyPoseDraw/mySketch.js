// TODO Load image
let img;

// Canva/Webcam size
let xMax = 1*640;
let yMax = 1*480;

// HAND DETECTION VARIABLES
//handPose options
let options = {
  modelType: "SINGLEPOSE_LIGHTNING", // "MULTIPOSE_LIGHTNING", "SINGLEPOSE_LIGHTNING", or "SINGLEPOSE_THUNDER".
  enableSmoothing: true,
  minPoseScore: 0.25,
  multiPoseMaxDimension: 256,
  enableTracking: true,
  trackerType: "boundingBox", // "keypoint" or "boundingBox"
  trackerConfig: {},
  modelUrl: undefined,
  flipped: true
}


// video and pose variables used during detection
let video;
let bodyPose;
let poses = [];
let detectedRightHand = null;

// BRUSH PAINTING VARIABLES
// brushSize simply is the thikness of the brush stroke
let brushSize = 40;
let f = 0.5;
let spring = 0.4;
let friction = 0.45;
let v = 0.5;
let r = 0;
let vx = 0;
let vy = 0;
let splitNum = 100;
let diff = 8;


function preload() {
  // Load the handPose model.
  bodyPose = ml5.bodyPose(options);
	//Load background image
	img = loadImage('texture.jpg');
}

function setup() {
  // Fixed size
	//createCanvas(xMax, yMax);
	// window Full Size
	createCanvas(windowWidth, windowHeight);
	background('#FFFFFF');
	// Draw the image.
  //image(img, 0, 0);
	
	// Create the webcam video and hide it
  video = createCapture(VIDEO);
	
	// Fixed Size
  //video.size(xMax, yMax);
	// window Full Size
  video.size(windowWidth, windowHeight);
	
	video.hide();
  // start detecting hands from the webcam video
  bodyPose.detectStart(video, gotPoses);
}


function draw() {
	// Get Handedness
	getRightHand();
	// Draw brush according to right hand detection
	//drawBrush();
  drawBrushTexture();
}

// Brush-like drawing function (with texture from loaded image)
function drawBrushTexture(){	
	// If right hand is detected, start drawing
	if(detectedRightHand != null) {
	// initialize wrist coordinates
	wx = detectedRightHand.x;
	wy = detectedRightHand.y;
	/*
    Smoother movement than using mouse coordinates
  */
  /*
    Parameters used
      size : Brush size
      spring : Spring constant(Larger value means stronger spring)
      friction : Friction(Smaller value means, the more slippery)
  */
    if(!f) {
      // Initialize coordinates
      f = true;
      x = wx;
      y = wy;
    }
		
    // Calculate velocity
    /*
      MEMO : Use Hooke's law to make spring motion
        DistanceX = (X1 - X0)
        SpringConstant = (value between 0 and 1)
        AccelerationX = DistanceX * SpringConstant
        VelocityX = ( VelocityX + AccelerationX ) * Friction
    */
    vx += ( wx - x ) * spring;
    vy += ( wy - y ) * spring;
    vx *= friction;
    vy *= friction;

    v += sqrt( vx*vx + vy*vy ) - v;
    v *= 0.6;

    oldR = r;
    r = brushSize - v;
		
    // Draw at the calculated coordinates
    for( let i = 0; i < splitNum; ++i ) {
      oldX = x;
      oldY = y;
      x += vx / splitNum;
      y += vy / splitNum;
      oldR += ( r - oldR ) / splitNum;
      if(oldR < 1) { oldR = 1; }
      strokeWeight( oldR+diff );  // AMEND: oldR -> oldR+diff
      stroke(img.get(x, y)); // Fill with the color of the image at the current position
      line( x, y, oldX, oldY );
      strokeWeight( oldR );  // ADD
      stroke(img.get(x+diff*1.5, y+diff*2)); // Fill with the color of the image at the offset position
      line( x+diff*1.5, y+diff*2, oldX+diff*2, oldY+diff*2 );  // ADD
      line( x-diff, y-diff, oldX-diff, oldY-diff );  // ADD
    }

  }
	// If no right hand is detected, do not draw
	else if(f) {
    // Reset state
    vx = vy = 0;
    f = false;
  }
}

// Brush-like drawing function
function drawBrush(){	
	// If right hand is detected, start drawing
	if(detectedRightHand != null) {
	// initialize wrist coordinates
	wx = detectedRightHand.x;
	wy = detectedRightHand.y;
	/*
    Smoother movement than using mouse coordinates
  */
  /*
    Parameters used
      size : Brush size
      spring : Spring constant(Larger value means stronger spring)
      friction : Friction(Smaller value means, the more slippery)
  */
    if(!f) {
      // Initialize coordinates
      f = true;
      x = wx;
      y = wy;
    }
		
    // Calculate velocity
    /*
      MEMO : Use Hooke's law to make spring motion
        DistanceX = (X1 - X0)
        SpringConstant = (value between 0 and 1)
        AccelerationX = DistanceX * SpringConstant
        VelocityX = ( VelocityX + AccelerationX ) * Friction
    */
    vx += ( wx - x ) * spring;
    vy += ( wy - y ) * spring;
    vx *= friction;
    vy *= friction;

    v += sqrt( vx*vx + vy*vy ) - v;
    v *= 0.6;

    oldR = r;
    r = brushSize - v;
		
    // Draw at the calculated coordinates
    for( let i = 0; i < splitNum; ++i ) {
      oldX = x;
      oldY = y;
      x += vx / splitNum;
      y += vy / splitNum;
      oldR += ( r - oldR ) / splitNum;
      if(oldR < 1) { oldR = 1; }
      strokeWeight( oldR+diff );  // AMEND: oldR -> oldR+diff
      line( x, y, oldX, oldY );
      strokeWeight( oldR );  // ADD
      line( x+diff*1.5, y+diff*2, oldX+diff*2, oldY+diff*2 );  // ADD
      line( x-diff, y-diff, oldX-diff, oldY-diff );  // ADD
    }

  }
	// If no right hand is detected, do not draw
	else if(f) {
    // Reset state
    vx = vy = 0;
    f = false;
  }
}


///////////
// Pose detection functions
///////////

// Callback function for when the model returns pose data
function gotPoses(results) {
  // Store the model's results in a global variable
  poses = results;
}

// getRightHand 
function getRightHand() {
	for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // Get the right hand keypoints
    let rightHand = pose.right_wrist;
		//console.log(pose);
    //console.log(rightHand);
    if (rightHand.confidence > 0.1) {
      detectedRightHand = rightHand;
    }
    else {
      detectedRightHand = null;
    }
	}
}

function keyPressed() {
  background('#FFFFFF');
	// Draw the image again.
  //image(img, 0, 0);
}

// pose results example
/*
keypoints: Array
confidence: 0.5691803395748138
nose: Object
  x: 1710.4107371126702
  y: 1172.0283609321361
  confidence: 0.030353402718901634
left_eye: Object
right_eye: Object
left_ear: Object
right_ear: Object
left_shoulder: Object
right_shoulder: Object
left_elbow: Object
right_elbow: Object
left_wrist: Object
right_wrist: Object
left_hip: Object
right_hip: Object
left_knee: Object
right_knee: Object
left_ankle: Object
right_ankle: Object

*/