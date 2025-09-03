// TODO Load image
let img;
let img1, img2, img3;

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

let confidenceThreshold = 0.1; // minimum confidence to consider a detection valid

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
	
    // Configurar los seleccionadores de imágenes
    setupImageSelectors();

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
  drawBrushTextureMap();
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

// Brush-like drawing function (with texture from loaded image)
// and re-mapping brush color from image size
function drawBrushTextureMap(){	
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
      stroke(img.get(map(x, 0, windowWidth, 0, img.width), map(y, 0, windowHeight, 0, img.height))); // Fill with the color of the image at the current position
      line( x, y, oldX, oldY );
      strokeWeight( oldR );  // ADD
      stroke(img.get(map(x+diff*1.5, 0, windowWidth, 0, img.width), map(y+diff*2, 0, windowHeight, 0, img.height)));
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
    if (rightHand.confidence > confidenceThreshold) {
      detectedRightHand = rightHand;
    }
    else {
      detectedRightHand = null;
    }
	}
}

function keyPressed() {
  //resizeCanvas(windowWidth, windowHeight);
  if (key === '1' && img1) {
    background('#FFFFFF');
    img = img1; // Cambiar a la imagen 1
    console.log("Imagen cambiada a la Imagen 1.");
} else if (key === '2' && img2) {
    background('#FFFFFF');
    img = img2; // Cambiar a la imagen 2
    console.log("Imagen cambiada a la Imagen 2.");
} else if (key === '3' && img3) {
    background('#FFFFFF');
    img = img3; // Cambiar a la imagen 3
    console.log("Imagen cambiada a la Imagen 3.");
}
  // Draw the image again.
  //image(img, 0, 0);
}


// Función para manejar la carga de imágenes
function setupImageSelectors() {
  const image1Input = document.getElementById('image1');
  const image2Input = document.getElementById('image2');
  const image3Input = document.getElementById('image3');

  // Cargar la imagen 1
  image1Input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
              img1 = loadImage(e.target.result, () => {
                  console.log("Imagen 1 cargada correctamente.");
              });
          };
          reader.readAsDataURL(file);
      } else {
          alert("Por favor, selecciona un archivo de imagen válido.");
      }
  });

  // Cargar la imagen 2
  image2Input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
              img2 = loadImage(e.target.result, () => {
                  console.log("Imagen 2 cargada correctamente.");
              });
          };
          reader.readAsDataURL(file);
      } else {
          alert("Por favor, selecciona un archivo de imagen válido.");
      }
  });

  // Cargar la imagen 3
  image3Input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
              img3 = loadImage(e.target.result, () => {
                  console.log("Imagen 3 cargada correctamente.");
              });
          };
          reader.readAsDataURL(file);
      } else {
          alert("Por favor, selecciona un archivo de imagen válido.");
      }
  });
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