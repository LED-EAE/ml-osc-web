# Machine Learning + OSC: interfaz web para instalaciones multimedia

Implementación de una interfaz web para traducir la clasificación de imágenes/pose/audio a señales OSC (Open Source Control). La web de prueba se encuentra [alojada en GitHub Pages del projecto](https://led-eae.github.io/ml-osc-web/).


## OSC-Web Bridge

La interfaz web depende de un _OSC-Web Bridge_ que sirve de intermediario entre la aplicación web y el software que recibe la señal OSC. Se utiliza la implementación de Vilson Vieria disponible en su [repositorio GitHub](https://github.com/automata/osc-web ). Facilitamos nuestro repositorio una versión del Bridge con un mensaje de bienvenida al levantar la aplicación.

**Pre-requisitos para instalar, abrir e interactuar con el OSC-Web Bridge:**

- [Node.js y npm](https://nodejs.org/en/download).
- Socket.io: por medio de Terminal luego de haber instalado npm.

```bash
  npm install socket.io-client
```

**Nota:** esta implentación se probó con Node.js v22.16.0 y Socket.io v4.8.1.

## Carga del modelo de clasificación via ml5.js y p5.js

Por defecto, se usan algunos modelos de clasificación pre-entrenados en [Teachable Machine](https://teachablemachine.withgoogle.com/). No obstante, se podría utilizar cualquier modelo de clasificación soportado por [ml5.js](https://ml5js.org/).

```javascript
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/sFYk-WB-_/';

////////////
// Load the model first
function preload() {
    classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}
```
Los archivos .js que se encargan de dibujar el área de trabajo utilizan la librería p5.js para cargar los dispositivos de entrada de audio/video requeridos por el clasificador para procesar las señales y retornar la lista de resultados por clase y porcentaje de confianza.

En general, se utilizó la plantilla de Javascript proporcionada por Teachable Machine como punto de partida para cargar y procesar los modelos de clasificación.

```javascript
// Video
let video;
let flippedVideo;

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

// Get a prediction for the current video frame
function classifyVideo() {
	flippedVideo = ml5.flipImage(video)
	classifier.classify(flippedVideo, gotResult);
	flippedVideo.remove();
}
```
## Librería osc.util.js

A partir del [proyecto osc in p5.js (Gene Kogan)](https://github.com/genekogan/p5js-osc), se encapsularon sus funciones utilitarias Javascript en la librería `osc.util.js`. Así se puede establecer y enviar/recibir señales OSC al Bridge OSC-Web de forma más versátil al importarlo en el HTML de los distintos sketchs p5.js del proyecto.

```html
<head>
    (...)
    <script src="../js/libraries/osc.util.js"></script>
</head>
```

## Caso de uso: instalación interactiva "El susurro de los objetos"

Esta interfaz fue utilizada como parte del la instalación artística [El susurro de los objetos](https://sites.google.com/una.cr/led/inicio/investigaciones-art%C3%ADsticas-en-curso/digitalizando-el-museo-de-cultura-popular) del LED. En esta instalación, objetos físicos específicos son reconocidos por un modelo de reconocimiento de imágenes de Teachable Machine. Por otra parte, se construyó una interfaz web especializada para enviar señales OSC al _OSC-Web Bridge_ compatibles con el disparo de queues en [QLab](https://qlab.app/).


## Licencia

[MIT](https://choosealicense.com/licenses/mit/)


## Autor

- [Julio Quimbayo, M.A.](https://github.com/JulioQB89)
